---
name: guard
preamble-tier: 1
version: 1.0.0
description: |
  激活完整安全模式：同时运行 /careful（销毁警告）和 /freeze（目录锁定）。
  一个命令可以启用两者，防止危险的 rm -rf、DROP TABLE 和无关的编辑。
  使用 /unfreeze 仅解除冻结，或 /careful-off 对销毁警告条件进行微调。
allowed-tools:
  - Bash
  - AskUserQuestion
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## 前置步骤(首先运行)

```bash
_UPD=$(~/.claude/skills/gstack/bin/gstack-update-check 2>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2>/dev/null || true
_PROACTIVE=$(~/.claude/skills/gstack/bin/gstack-config get proactive 2>/dev/null || echo "true")
_PROACTIVE_PROMPTED=$([ -f ~/.gstack/.proactive-prompted ] && echo "yes" || echo "no")
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SKILL_PREFIX=$(~/.claude/skills/gstack/bin/gstack-config get skill_prefix 2>/dev/null || echo "false")
echo "PROACTIVE: $_PROACTIVE"
echo "PROACTIVE_PROMPTED: $_PROACTIVE_PROMPTED"
echo "SKILL_PREFIX: $_SKILL_PREFIX"
source <(~/.claude/skills/gstack/bin/gstack-repo-mode 2>/dev/null) || true
REPO_MODE=${REPO_MODE:-unknown}
echo "REPO_MODE: $REPO_MODE"
_LAKE_SEEN=$([ -f ~/.gstack/.completeness-intro-seen ] && echo "yes" || echo "no")
echo "LAKE_INTRO: $_LAKE_SEEN"
_TEL=$(~/.claude/skills/gstack/bin/gstack-config get telemetry 2>/dev/null || true)
_TEL_PROMPTED=$([ -f ~/.gstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo "TELEMETRY: ${_TEL:-off}"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"guard","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
```

# /guard — 激活完整安全模式

您正在激活**完整安全模式**：同时启用 `/careful`（销毁警告）和 `/freeze`（目录锁定）。

一个命令可以完全保护您免受意外删除、表格截断和无关编辑的影响。

## 用户可调用
当用户输入 `/guard` 时运行此技能。

## 说明

### 第 1 步：询问范围

使用 AskUserQuestion：

> 安全模式对什么进行保护？您希望 gstack 在哪些操作上给出警告、要困难的确认，以及哪些目录应该被锁定以防止意外编辑？

选项：
- A) **完整受保护（推荐）**：`rm -rf`、`DROP TABLE`、`force-push` 所有警告；锁定根目录 — 只允许特定目录编辑
- B) **有针对性的警告**：只对 `DROP TABLE` 和 `force-push` 发出警告；锁定 `src/db/` 和 `migrations/`
- C) **自定义**：告诉我什么命令您想要警告以及要冻结哪些目录

### 第 2 步：根据选择进行配置

#### 选项 A：完整受保护

```bash
# 启用 /careful 模式
touch ~/.gstack/.careful-mode

# 询问要排除的目录
```

使用 AskUserQuestion：

> 哪些目录应该对编辑开放？（例如 `src`, `components`, `lib`）
> 其他所有内容将被冻结。

读取响应。如果它是逗号分隔的列表（如 `src, components`），规范化为：

```bash
ALLOWED_DIRS=$(echo "src,components" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | tr '\n' '|')
echo "$ALLOWED_DIRS" > ~/.gstack/.allowed-dirs
```

然后冻结根目录：

```bash
echo "." > ~/.gstack/.frozen
touch ~/.gstack/.freeze-mode
```

#### 选项 B：有针对性的警告

```bash
echo "DROP TABLE" > ~/.gstack/.careful-warnings
echo "force-push" >> ~/.gstack/.careful-warnings

echo "src/db" > ~/.gstack/.frozen
echo "migrations" >> ~/.gstack/.frozen
touch ~/.gstack/.freeze-mode
```

#### 选项 C：自定义

使用 AskUserQuestion：

> 要对哪些命令发出警告？（例如 `rm -rf`, `DROP TABLE`, `force-push`）
> 列表用逗号分隔。

```bash
WARNINGS=$(ask response)
echo "$WARNINGS" | tr ',' '\n' | sed 's/^ *//;s/ *$//' > ~/.gstack/.careful-warnings
```

然后询问：

> 要冻结哪些目录？

```bash
FROZEN=$(ask response)
echo "$FROZEN" | tr ',' '\n' | sed 's/^ *//;s/ *$//' > ~/.gstack/.frozen
touch ~/.gstack/.freeze-mode
```

### 第 3 步：确认

```bash
echo ""
echo "安全模式 — 已激活"
echo "════════════════════"
[ -f ~/.gstack/.careful-mode ] && echo "✓ 销毁警告：启用"
[ -f ~/.gstack/.freeze-mode ] && echo "✓ 目录锁定：启用"
[ -f ~/.gstack/.frozen ] && echo "✓ 冻结目录："
cat ~/.gstack/.frozen | sed 's/^/  — /'
echo ""
echo "下一步："
echo "— 运行命令。gstack 将在销毁操作上发出警告。"
echo "— 尝试编辑冻结目录 — 您会看到阻止。"
echo "— 使用 /unfreeze 来清除冻结。"
echo "— 使用 /careful-off 来禁用销毁警告。"
```

## 重要规则

- **销毁警告是建议性的。** 用户最终可以继续，但会看到红色警告。
- **冻结是硬块。** 您无法编辑冻结目录 — gstack 会拒绝请求。
- **/guard 不会**影响读取。您仍然可以读取任何目录；只有写入被阻止。
- **链接范围。** `/unfreeze` 清除目录冻结。`/careful-off` 禁用销毁警告。
- **幂等性。** 多次运行 `/guard` 会干净地更新配置。

## 下一步

- 使用 `/unfreeze` 来清除目录冻结
- 使用 `/careful-off` 来禁用销毁警告
- 编辑 `~/.gstack/.frozen` 来手动调整冻结目录
- 编辑 `~/.gstack/.careful-warnings` 来调整警告触发器
