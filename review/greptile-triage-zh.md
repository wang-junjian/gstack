# Greptile注释分类

在GitHub PRS上获取、过滤和分类Greptile审查注释的共享参考。 `/review`（第2.5步）和 `/ship`（第3.75步）引用此文档。

---

## 获取

运行这些命令来检测PR并获取注释。两个API调用并行运行。

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null)
PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)
```

**如果任一失败或为空：** 静默跳过Greptile分类。此集成是附加的 — 工作流不需要它就能工作。

```bash
# 平行获取行级审查注释和顶级PR注释
gh api repos/$REPO/pulls/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]") | select(.position != null) | {id: .id, path: .path, line: .line, body: .body, html_url: .html_url, source: "line-level"}' > /tmp/greptile_line.json &
gh api repos/$REPO/issues/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]") | {id: .id, body: .body, html_url: .html_url, source: "top-level"}' > /tmp/greptile_top.json &
wait
```

**如果API错误或两个端点间的零Greptile注释：** 静默跳过。

线级注释上的 `position != null` 过滤自动跳过来自力推代码的过时注释。

---

## 抑制检查

导出项目特定历史路径：
```bash
REMOTE_SLUG=$(browse/bin/remote-slug 2>/dev/null || ~/.claude/skills/gstack/browse/bin/remote-slug 2>/dev/null || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
PROJECT_HISTORY="$HOME/.gstack/projects/$REMOTE_SLUG/greptile-history.md"
```

读 `$PROJECT_HISTORY` 如果它存在（每项目抑制）。每行记录先前的分类结果：

```
<date> | <repo> | <type:fp|fix|already-fixed> | <file-pattern> | <category>
```

**类别**（固定集）：`race-condition`、`null-check`、`error-handling`、`style`、`type-safety`、`security`、`performance`、`correctness`、`other`

匹配每个获取的注释对抗条目其中：
- `type == fp`（仅抑制已知假正，不是先前修复的真实问题）
- `repo` 匹配当前项目
- `file-pattern` 匹配注释的文件路径
- `category` 匹配注释中的问题类型

跳过匹配的注释为**已抑制**。

如果历史文件不存在或有无法解析的行，跳过这些行并继续 — 永不在格式错误的历史文件上失败。

---

## 分类

对于每个未抑制的注释：

1. **行级注释：** 读指定 `path:line` 处的文件和周围上下文（±10行）
2. **顶级注释：** 读完整注释正文
3. 交叉参考注释对抗完整diff（`git diff origin/main`）和审查清单
4. 分类：
   - **有效和可操作的** — 一个真实bug、竞态条件、安全问题或存在于当前代码中的正确性问题
   - **有效但已修复** — 一个真实问题，在分支上的后续提交中被解决。确定修复提交SHA。
   - **假正** — 注释误解代码、在别处处理的标记或样式噪音
   - **已抑制** — 已在抑制检查中过滤

---

## 回复API

当回复Greptile注释时，根据注释来源使用正确的端点：

**行级注释**（来自 `pulls/$PR/comments`）：
```bash
gh api repos/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies \
  -f body="<reply text>"
```

**顶级注释**（来自 `issues/$PR/comments`）：
```bash
gh api repos/$REPO/issues/$PR_NUMBER/comments \
  -f body="<reply text>"
```

**如果回复POST失败**（例如，PR被关闭，无写权限）：警告并继续。不因失败的回复停止工作流。

---

## 回复模板

为每个Greptile回复使用这些模板。始终包含具体证据 — 永不发邮件模糊回复。

### 第一层（首次回复） — 友好，包含证据

**对于修复（用户选择修复问题）：**

```
**已修复**在 `<commit-sha>`。

\`\`\`diff
- <旧有问题的行（s）>
+ <新修复的行（s）>
\`\`\`

**为什么：** <1句话解释什么是错的和修复如何处理它>
```

**对于已修复（问题在分支上的先前提交中处理）：**

```
**已在 `<commit-sha>` 中修复**。

**做了什么：** <1-2句话描述现有提交如何解决此问题>
```

**对于假正（注释不正确）：**

```
**不是bug。** <1句话直接说明为什么这不正确>

**证据：**
- <显示模式安全/正确的具体代码参考>
- <例如，"nil检查由 `ActiveRecord::FinderMethods#find` 处理，抛出RecordNotFound，不是nil">

**建议重新排名：** 这看起来像是 `<style|noise|misread>` 问题，不是 `<Greptile叫它的什么>`。考虑降低严重性。
```

### 第二层（Greptile在先前回复后重新标记） — 坚定，压倒性证据

当升级检测（下面）确定先前GStack回复存在于同一线程上时使用第二层。包括最大证据来结束讨论。

```
**这已被审查和确认为 [故意/已修复/不是bug]。**

\`\`\`diff
<完整的相关diff显示变化或安全模式>
\`\`\`

**证据链：**
1. <file:line永久链接显示安全模式或修复>
2. <提交SHA如果适用>
3. <架构理由或设计决定，如果适用>

**建议重新排名：** 请校准 — 这是 `<实际类别>` 问题，不是 `<宣布的类别>`。[链接到特定文件变更永久链接如果有帮助]
```

---

## 升级检测

在组合回复前，检查此注释线程上是否存在先前GStack回复：

1. **对于行级注释：** 通过 `gh api repos/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies` 获取回复。检查任何回复正文是否包含GStack标记：`**Fixed**`、`**Not a bug.**`、`**Already fixed**`。

2. **对于顶级注释：** 扫描获取的问题注释以查找Greptile注释后发布的回复，包含GStack标记。

3. **如果先前GStack回复存在且Greptile在同一文件+类别上再次发帖：** 使用第二层（坚定）模板。

4. **如果不存在先前GStack回复：** 使用第一层（友好）模板。

如果升级检测失败（API错误、模糊线程）：默认第一层。永不在模糊时升级。

---

## 严重性评估和重新排名

分类注释时，也评估Greptile的暗示严重性是否与现实匹配：

- 如果Greptile标记某些东西为**安全/正确性/竞态条件**问题但它实际上是一个**样式/性能**小事：在回复中包括 `**建议重新排名：**` 请求类别被更正。
- 如果Greptile标记低严重性样式问题好像它是关键的：在回复中推回。
- 始终对重新排名有根据 — 引用代码和行号，不是意见。

---

## 历史文件写入

在写入前，确保两个目录存在：
```bash
REMOTE_SLUG=$(browse/bin/remote-slug 2>/dev/null || ~/.claude/skills/gstack/browse/bin/remote-slug 2>/dev/null || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
mkdir -p "$HOME/.gstack/projects/$REMOTE_SLUG"
mkdir -p ~/.gstack
```

附加一行每个分类结果到**两个**文件（每项目抑制，全局用于回顾）：
- `~/.gstack/projects/$REMOTE_SLUG/greptile-history.md`（每项目）
- `~/.gstack/greptile-history.md`（全局聚合）

格式：
```
<YYYY-MM-DD> | <owner/repo> | <type> | <file-pattern> | <category>
```

示例条目：
```
2026-03-13 | garrytan/myapp | fp | app/services/auth_service.rb | race-condition
2026-03-13 | garrytan/myapp | fix | app/models/user.rb | null-check
2026-03-13 | garrytan/myapp | already-fixed | lib/payments.rb | error-handling
```

---

## 输出格式

在输出标题中包括Greptile摘要工作：
```
+ N Greptile注释（X有效，Y修复，Z假正）
```

对于每个分类注释，显示：
- 分类标签：`[有效]`、`[修复]`、`[假正]`、`[已抑制]`
- 文件：行参考（对于行级）或 `[top-level]`（对于顶级）
- 一行正文摘要
- 永久链接URL（`html_url`字段）
