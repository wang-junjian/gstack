# 更新日志

## [0.15.16.0] - 2026-04-06

### 新增
- 通过 TabSession 进行每个标签页状态隔离。每个浏览器标签页现在都有自己的参考映射、快照基线和框架上下文。以前，这些是 BrowserManager 上的全局，意味着一个标签页的快照引用可能与另一个发生冲突。这是并行多标签页操作的基础。
- BROWSER.md 中的批处理端点文档，包括 API 形状、设计决策和使用模式。

### 变更
- 跨读命令、写命令、元命令和快照的处理程序签名现在接受 TabSession 用于每标签页操作，接受 BrowserManager 用于全局操作。这种分离使得明确操作是标签页范围还是浏览器范围。

### 修复
- codex-review E2E 测试复制了完整的 55KB SKILL.md（1,075 行），消耗 8 次读取调用只是为了使用它，耗尽 15 轮预算，然后才进行实际审查。现在仅提取审查相关部分（~6KB/148 行），将读取调用从 8 减少到 1。测试从持续超时变为在 141 秒内通过。

## [0.15.15.1] - 2026-04-06

### 修复
- pair-agent 隧道在 15 秒后断开。浏览服务器正在监视其父进程 ID，并在 CLI 退出时自动终止。现在 pair-agent 会话禁用父监视程序，以便服务器和隧道保持活动。
- `$B connect` 因"domains 未定义"而崩溃。GStack 浏览器初始化中状态检查中的一个错误变量引用阻止了正确初始化。

## [0.15.15.0] - 2026-04-06

社区安全波：来自 4 名贡献者的 8 个 PR，每个修复都列为共同作者。

### 新增
- Cookie 值针对令牌、API 密钥、JWT 和会话秘密在 `browse cookies` 输出中的编辑。你的秘密不再出现在 Claude 的上下文中。
- URL 验证中的 IPv6 ULA 前缀阻止（fc00::/7）。覆盖完整的唯一本地范围，而不仅仅是文字 `fd00::`。像 `fcustomer.com` 这样的主机名不是假阳性。
- 侧边栏智能体的每标签页取消信令。停止一个标签页的智能体不再终止所有标签页。
- 浏览服务器的父进程监视程序。当 Claude Code 退出时，孤立的浏览器进程现在在 15 秒内自行终止。
- README 中的卸载说明（脚本 + 手动移除步骤）。
- CSS 值验证块在 style 命令中阻止 `url()`、`expression()`、`@import`、`javascript:` 和 `data:`，防止 CSS 注入攻击。
- 队列条目架构验证（`isValidQueueEntry`），包括对 `stateFile` 和 `cwd` 的路径遍历检查。
- 视口尺寸夹紧（1-16384）和等待超时夹紧（1 秒-300 秒），防止 OOM 和失控等待。
- Cookie 域验证在 `cookie-import` 中防止跨站点 Cookie 注入。
- 侧边栏中基于 DocumentFragment 的标签页切换（替换 innerHTML 往返 XSS 向量）。
- `pollInProgress` 重入保护防止并发聊天轮询破坏状态。
- 750+ 行新的安全回归测试，跨 4 个测试文件。
- Supabase 迁移 003：列级 GRANT 将 anon UPDATE 限制为仅(last_seen、gstack_version、os)。

### 修复
- Windows：`extraEnv` 现在通过 Windows 启动器（以前被静默丢弃）。
- Windows：欢迎页面提供内联 HTML 而不是 `about:blank` 重定向（修复 ERR_UNSAFE_REDIRECT）。
- 有头模式：即使没有 Origin 标头也返回身份验证令牌（修复 Playwright Chromium 扩展）。
- `frame --url` 现在在构造 RegExp 前转义用户输入（ReDoS 修复）。
- 注释的截图路径验证现在解析符号链接（以前可通过符号链接遍历绕过）。
- 从单播中移除身份验证令牌，通过目标的 `getToken` 处理程序传递。
- `/health` 端点不再公开 `currentUrl` 或 `currentMessage`。
- 会话 ID 在文件路径中使用前验证（防止通过精心设计的 active.json 的路径遍历）。
- 侧边栏智能体超时处理程序中的 SIGTERM/SIGKILL 升级（以前是裸的 `kill()`）。

### 贡献者
- 队列文件创建时具有 0o700/0o600 权限（服务器、CLI、sidebar-agent）。
- `escapeRegExp` 实用工具从元命令导出。
- 状态加载过滤来自本地主机的 Cookie、.internal 和元数据域。
- 遥测同步记录来自安装跟踪的更新错误。

## [0.15.14.0] - 2026-04-05

### 修复

- **`gstack-team-init` 现在检测并移除供应商的 gstack 副本。** 当你在将 gstack 供应商放在 `.claude/skills/gstack/` 的仓库中运行 `gstack-team-init` 时，它会自动移除供应商副本，不追踪它，并将其添加到 `.gitignore`。没有更多陈旧的供应商副本阻止全局安装。
- **`/gstack-upgrade` 尊重团队模式。** 第 4.5 步现在检查 `team_mode` 配置。在团队模式中，移除供应商副本而不是同步，因为全局安装是单个真理来源。
- **`team_mode` 配置密钥。** `./setup --team` 和 `./setup --no-team` 现在设置专用 `team_mode` 配置密钥，使升级技能能够可靠地区分团队模式与仅自动升级启用。

## [0.15.13.0] - 2026-04-04 — 团队模式

团队现在可以自动将每个开发者保持在同一 gstack 版本上。不再将 342 个文件供应到你的仓库。不再跨分支的版本漂移。不再"谁最后升级了 gstack?"Slack 线程。一个命令，每个开发者都是最新的。

致敬 Jared Friedman 的设计。

### 新增

- **`./setup --team`。** 在 `~/.claude/settings.json` 中注册一个 `SessionStart` 钩子，在每个 Claude Code 会话开始时自动更新 gstack。在后台运行（零延迟），限制为每小时一次，网络故障安全，完全无声。`./setup --no-team` 反转它。
- **`./setup -q` / `--quiet`。** 禁止所有信息输出。由会话更新钩子使用，但对 CI 和脚本安装也有用。
- **`gstack-team-init` 命令。** 生成仓库级别引导文件，两种风味：`optional`（温和的 CLAUDE.md 建议、每开发者一次性报价）或 `required`（CLAUDE.md 强制 + PreToolUse 钩子，没有安装的 gstack 阻止工作）。
- **`gstack-settings-hook` 帮助程序。** DRY 实用程序，用于在 Claude Code 的 `settings.json` 中添加/移除钩子。原子写入（.tmp + rename）防止破坏。
- **`gstack-session-update` 脚本。** SessionStart 钩子目标。后台分支、带陈旧恢复的 PID 锁定文件、`GIT_TERMINAL_PROMPT=0` 防止凭据提示挂起、调试日志在 `~/.gstack/analytics/session-update.log`。
- **前言中的供应商弃用。** 每个技能现在检测项目中的供应商 gstack 副本，并提供一次性迁移到团队模式。"你想让我为你做吗?"比"这是 4 个手动步骤"更好。

### 变更

- **供应商已弃用。** README 不再建议将 gstack 复制到你的仓库。全局安装 + `--team` 是方式。`--local` 标志仍然有效但打印弃用警告。
- **卸载清理钩子。** `gstack-uninstall` 现在从 `~/.claude/settings.json` 中移除 SessionStart 钩子。

---

更多版本信息请查看完整的 CHANGELOG.md 文件。
