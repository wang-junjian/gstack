---
name: setup-deploy
preamble-tier: 2
version: 1.0.0
description: |
  为 /land-and-deploy 配置部署设置。检测您的部署平台（Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions、自定义），生产 URL、健康检查端点和部署状态命令。
  将配置写入 CLAUDE.md，以便所有未来部署都是自动的。
  使用场景："setup deploy"、"configure deployment"、"set up land-and-deploy"、"how do I deploy with gstack"、"add deploy config"。
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
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
echo '{"skill":"setup-deploy","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
# zsh-compatible: use find instead of glob to avoid NOMATCH error
for _PF in $(find ~/.gstack/analytics -maxdepth 1 -name '.pending-*' 2>/dev/null); do
  if [ -f "$_PF" ]; then
    if [ "$_TEL" != "off" ] && [ -x "~/.claude/skills/gstack/bin/gstack-telemetry-log" ]; then
      ~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type skill_run --skill _pending_finalize --outcome unknown --session-id "$_SESSION_ID" 2>/dev/null || true
    fi
    rm -f "$_PF" 2>/dev/null || true
  fi
  break
done
# Learnings count
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
_LEARN_FILE="${GSTACK_HOME:-$HOME/.gstack}/projects/${SLUG:-unknown}/learnings.jsonl"
if [ -f "$_LEARN_FILE" ]; then
  _LEARN_COUNT=$(wc -l < "$_LEARN_FILE" 2>/dev/null | tr -d ' ')
  echo "LEARNINGS: $_LEARN_COUNT entries loaded"
  if [ "$_LEARN_COUNT" -gt 5 ] 2>/dev/null; then
    ~/.claude/skills/gstack/bin/gstack-learnings-search --limit 3 2>/dev/null || true
  fi
else
  echo "LEARNINGS: 0"
fi
# Session timeline: record skill start (local-only, never sent anywhere)
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"setup-deploy","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
# Check if CLAUDE.md has routing rules
_HAS_ROUTING="no"
if [ -f CLAUDE.md ] && grep -q "## Skill routing" CLAUDE.md 2>/dev/null; then
  _HAS_ROUTING="yes"
fi
_ROUTING_DECLINED=$(~/.claude/skills/gstack/bin/gstack-config get routing_declined 2>/dev/null || echo "false")
echo "HAS_ROUTING: $_HAS_ROUTING"
echo "ROUTING_DECLINED: $_ROUTING_DECLINED"
# Vendoring deprecation: detect if CWD has a vendored gstack copy
_VENDORED="no"
if [ -d ".claude/skills/gstack" ] && [ ! -L ".claude/skills/gstack" ]; then
  if [ -f ".claude/skills/gstack/VERSION" ] || [ -d ".claude/skills/gstack/.git" ]; then
    _VENDORED="yes"
  fi
fi
echo "VENDORED_GSTACK: $_VENDORED"
# Detect spawned session (OpenClaw or other orchestrator)
[ -n "$OPENCLAW_SESSION" ] && echo "SPAWNED_SESSION: true" || true
```

如果 `PROACTIVE` 为 `"false"`，则不要主动建议 gstack 技能，也不要根据对话上下文自动调用技能。仅当用户明确输入命令时才运行技能（例如 /qa、/ship）。如果您本来会自动调用一个技能，改为简短地说：
"我认为 /skillname 可能会有帮助 — 要我运行它吗？" 并等待确认。
用户已选择退出主动行为。

如果 `SKILL_PREFIX` 为 `"true"`，用户已为技能名称空间化。在建议或调用其他 gstack 技能时，使用 `/gstack-` 前缀（例如，使用 `/gstack-qa` 而不是 `/qa`）。磁盘路径不受影响 — 始终使用 `~/.claude/skills/gstack/[skill-name]/SKILL.md` 读取技能文件。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循"内联升级流程"（如果已配置则自动升级，否则使用 AskUserQuestion，如果拒绝则写入延期状态）。

如果 `LAKE_INTRO` 为 `no`：在继续前，介绍完整性原则。
告诉用户："gstack 遵循**煮沸湖泊**原则 — 当 AI 使边际成本接近零时，始终做完整的事情。阅读更多：https://garryslist.org/posts/boil-the-ocean"
然后提供在默认浏览器中打开文章的选项：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅当用户同意时运行 `open`。始终运行 `touch` 标记为已查看。这只发生一次。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：处理湖泊介绍后，询问用户关于遥测。使用 AskUserQuestion：

> 帮助 gstack 改进！社区模式会与稳定设备 ID 共享使用数据（您使用哪些技能、耗时多长、崩溃信息），这样我们可以更快地追踪趋势和修复错误。
> 从不发送代码、文件路径或存储库名称。
> 随时使用 `gstack-config set telemetry off` 更改。

选项：
- A) 帮助 gstack 改进！(推荐)
- B) 不谢谢

如果 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果 B：询问后续 AskUserQuestion：

> 匿名模式怎么样？我们只学习*有人*使用过 gstack — 没有唯一 ID，
> 无法连接会话。只是一个计数器，帮助我们知道是否有人在使用。

选项：
- A) 匿名模式可以
- B) 谢谢，完全关闭

如果 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

这只发生一次。如果 `TEL_PROMPTED` 为 `yes`，完全跳过。

[... 其余部分省略，保留原文格式...]

# /setup-deploy — 为 gstack 配置部署

您正在帮助用户配置部署，以便 `/land-and-deploy` 能够自动工作。
您的工作是检测部署平台、生产 URL、健康检查和部署状态命令 — 然后将所有内容保存到 CLAUDE.md。

运行一次后，`/land-and-deploy` 会读取 CLAUDE.md 并完全跳过检测。

## 用户可调用
当用户输入 `/setup-deploy` 时，运行此技能。

## 说明

### 第 1 步：检查现有配置

```bash
grep -A 20 "## Deploy Configuration" CLAUDE.md 2>/dev/null || echo "NO_CONFIG"
```

如果配置已存在，显示它并询问：

- **背景**：部署配置已在 CLAUDE.md 中存在。
- **推荐**：如果您的设置已更改，选择 A 进行更新。
- A) 从头重新配置(覆盖现有)
- B) 编辑特定字段(显示当前配置，让我更改一个)
- C) 完成 — 配置看起来正确

如果用户选择 C，停止。

### 第 2 步：检测平台

运行部署引导的平台检测：

```bash
# Platform config files
[ -f fly.toml ] && echo "PLATFORM:fly" && cat fly.toml
[ -f render.yaml ] && echo "PLATFORM:render" && cat render.yaml
[ -f vercel.json ] || [ -d .vercel ] && echo "PLATFORM:vercel"
[ -f netlify.toml ] && echo "PLATFORM:netlify" && cat netlify.toml
[ -f Procfile ] && echo "PLATFORM:heroku"
[ -f railway.json ] || [ -f railway.toml ] && echo "PLATFORM:railway"

# GitHub Actions deploy workflows
for f in $(find .github/workflows -maxdepth 1 \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null); do
  [ -f "$f" ] && grep -qiE "deploy|release|production|staging|cd" "$f" 2>/dev/null && echo "DEPLOY_WORKFLOW:$f"
done

# Project type
[ -f package.json ] && grep -q '"bin"' package.json 2>/dev/null && echo "PROJECT_TYPE:cli"
find . -maxdepth 1 -name '*.gemspec' 2>/dev/null | grep -q . && echo "PROJECT_TYPE:library"
```

### 第 3 步：平台特定设置

根据检测到的内容，引导用户完成平台特定的配置。

#### Fly.io

如果检测到 `fly.toml`：

1. 提取应用名称：`grep -m1 "^app" fly.toml | sed 's/app = "\(.*\)"/\1/'`
2. 检查 `fly` CLI 是否已安装：`which fly 2>/dev/null`
3. 如果已安装，验证：`fly status --app {app} 2>/dev/null`
4. 推断 URL：`https://{app}.fly.dev`
5. 设置部署状态命令：`fly status --app {app}`
6. 设置健康检查：`https://{app}.fly.dev`（如果应用有的话可以是 `/health`）

请用户确认生产 URL。一些 Fly 应用使用自定义域。

#### Render

如果检测到 `render.yaml`：

1. 从 render.yaml 中提取服务名称和类型
2. 检查 Render API 密钥：`echo $RENDER_API_KEY | head -c 4`（不要暴露完整密钥）
3. 推断 URL：`https://{service-name}.onrender.com`
4. Render 在推送到连接的分支时自动部署 — 不需要部署工作流
5. 设置健康检查：推断的 URL

请用户确认。 Render 使用来自连接的 git 分支的自动部署 — 合并到 main 后，Render 会自动选择。 /land-and-deploy 中的"部署等待"应该轮询 Render URL，直到它响应新版本。

#### Vercel

如果检测到 vercel.json 或 .vercel：

1. 检查 `vercel` CLI：`which vercel 2>/dev/null`
2. 如果已安装：`vercel ls --prod 2>/dev/null | head -3`
3. Vercel 在推送时自动部署 — 预览在 PR 上，生产在合并到 main
4. 设置健康检查：来自 vercel 项目设置的生产 URL

#### Netlify

如果检测到 netlify.toml：

1. 从 netlify.toml 中提取站点信息
2. Netlify 在推送时自动部署
3. 设置健康检查：生产 URL

#### 仅 GitHub Actions

如果检测到部署工作流但没有平台配置：

1. 读取工作流文件以了解其工作原理
2. 提取部署目标（如果提及）
3. 询问用户生产 URL

#### 自定义 / 手动

如果未检测到任何内容：

使用 AskUserQuestion 来收集信息：

1. **部署如何触发？**
   - A) 在推送到 main 时自动（Fly、Render、Vercel、Netlify 等）
   - B) 通过 GitHub Actions 工作流
   - C) 通过部署脚本或 CLI 命令（描述它）
   - D) 手动（SSH、控制板等）
   - E) 此项目不部署（库、CLI、工具）

2. **生产 URL 是什么？**（自由文本 — 应用运行的 URL）

3. **gstack 如何检查部署是否成功？**
   - A) 在特定 URL 处进行 HTTP 健康检查（例如 /health、/api/status）
   - B) CLI 命令（例如 `fly status`、`kubectl rollout status`）
   - C) 检查 GitHub Actions 工作流状态
   - D) 无自动化方式 — 只检查 URL 加载

4. **任何合并前或合并后的钩子？**
   - 合并前运行的命令（例如 `bun run build`）
   - 合并后但部署验证前运行的命令

### 第 4 步：写入配置

读取 CLAUDE.md（或创建它）。如果存在，找到并替换 `## Deploy Configuration` 部分，或在末尾附加它。

```markdown
## 部署配置（由 /setup-deploy 配置）
- 平台：{platform}
- 生产 URL：{url}
- 部署工作流：{workflow file or "auto-deploy on push"}
- 部署状态命令：{command or "HTTP health check"}
- 合并方法：{squash/merge/rebase}
- 项目类型：{web app / API / CLI / library}
- 合并后健康检查：{health check URL or command}

### 自定义部署钩子
- 合并前：{command or "none"}
- 部署触发器：{command or "automatic on push to main"}
- 部署状态：{command or "poll production URL"}
- 健康检查：{URL or command}
```

### 第 5 步：验证

写入后，验证配置有效：

1. 如果配置了健康检查 URL，尝试：
```bash
curl -sf "{health-check-url}" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "UNREACHABLE"
```

2. 如果配置了部署状态命令，尝试：
```bash
{deploy-status-command} 2>/dev/null | head -5 || echo "COMMAND_FAILED"
```

报告结果。如果任何操作失败，注记但不阻止 — 即使健康检查暂时无法访问，配置仍然有用。

### 第 6 步：总结

```
部署配置 — 完成
════════════════════════════════
平台：      {platform}
URL：       {url}
健康检查：  {health check}
状态命令：  {status command}
合并方法：  {merge method}

已保存到 CLAUDE.md。 /land-and-deploy 将自动使用这些设置。

下一步：
- 运行 /land-and-deploy 来合并并部署您的当前 PR
- 编辑 CLAUDE.md 中的"## Deploy Configuration"部分来更改设置
- 再次运行 /setup-deploy 进行重新配置
```

## 重要规则

- **永远不要暴露秘密。** 不要打印完整的 API 密钥、令牌或密码。
- **与用户确认。** 始终显示检测到的配置并在写入前请求确认。
- **CLAUDE.md 是真实来源。** 所有配置都在那里 — 不在单独的配置文件中。
- **幂等性。** 多次运行 /setup-deploy 会干净地覆盖以前的配置。
- **平台 CLI 是可选的。** 如果未安装 `fly` 或 `vercel` CLI，回退到基于 URL 的健康检查。
