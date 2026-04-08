# 架构

本文档解释了**为什么** gstack 以这种方式构建。有关设置和命令，请参阅 CLAUDE.md。有关贡献，请参阅 CONTRIBUTING.md。

## 核心思想

gstack 为 Claude Code 提供了一个持久的浏览器和一组有主见的工作流技能。浏览器是困难的部分——其他一切都是 Markdown。

关键洞察：与浏览器交互的智能体需要**亚秒级延迟**和**持久状态**。如果每个命令都冷启动一个浏览器，你需要等待 3-5 秒的工具调用。如果浏览器在命令之间崩溃，你会失去 cookies、标签页和登录会话。所以 gstack 运行一个长期存在的 Chromium 守护进程，CLI 通过 localhost HTTP 与之交互。

```
Claude Code                     gstack
─────────                      ──────
                               ┌──────────────────────┐
  工具调用: $B snapshot -i    │  CLI (编译的二进制)  │
  ─────────────────────────→   │  • 读取状态文件      │
                               │  • POST /command      │
                               │    到 localhost:PORT   │
                               └──────────┬───────────┘
                                          │ HTTP
                               ┌──────────▼───────────┐
                               │  服务器 (Bun.serve)  │
                               │  • 分派命令          │
                               │  • 与 Chromium 通话  │
                               │  • 返回纯文本        │
                               └──────────┬───────────┘
                                          │ CDP
                               ┌──────────▼───────────┐
                               │  Chromium (无头)     │
                               │  • 持久标签页        │
                               │  • cookies 保存下来  │
                               │  • 30分钟空闲超时    │
                               └───────────────────────┘
```

首次调用启动一切（~3 秒）。之后的每次调用：~100-200ms。

## 为什么选择 Bun

Node.js 也可以工作。Bun 在这里更好，有三个原因：

1. **编译的二进制文件。** `bun build --compile` 生成单个 ~58MB 可执行文件。运行时没有 `node_modules`，没有 `npx`，没有 PATH 配置。二进制文件就是可以运行的。这很重要，因为 gstack 安装到 `~/.claude/skills/` 中，用户不期望在那里管理 Node.js 项目。

2. **原生 SQLite。** Cookie 解密直接读取 Chromium 的 SQLite cookie 数据库。Bun 内置了 `new Database()` ——没有 `better-sqlite3`，没有原生插件编译，没有 gyp。一个不会在不同机器上破坏的东西少了一个。

3. **原生 TypeScript。** 服务器在开发中作为 `bun run server.ts` 运行。没有编译步骤，没有 `ts-node`，没有源映射要调试。编译的二进制文件用于部署；源文件用于开发。

4. **内置 HTTP 服务器。** `Bun.serve()` 很快、很简单，不需要 Express 或 Fastify。服务器处理 ~10 个路由。一个框架会是过度设计。

瓶颈总是 Chromium，不是 CLI 或服务器。Bun 的启动速度（~1ms 编译的二进制文件 vs ~100ms Node）很好，但不是我们选择它的原因。编译的二进制文件和原生 SQLite 才是。

## 守护进程模型

### 为什么不为每个命令启动一个浏览器？

Playwright 可以在 ~2-3 秒内启动 Chromium。对于单个截图，这很好。对于有 20+ 个命令的 QA 会话，这是 40+ 秒的浏览器启动开销。更糟的是：你在命令之间失去所有状态。Cookies、localStorage、登录会话、开放的标签页——都消失了。

守护进程模型意味着：

- **持久状态。** 登录一次，保持登录。打开一个标签页，它保持打开。localStorage 在命令之间保持。
- **亚秒级命令。** 首次调用后，每个命令都只是一个 HTTP POST。~100-200ms 往返，包括 Chromium 的工作。
- **自动生命周期。** 服务器在首次使用时自动启动，30 分钟空闲后自动关闭。不需要进程管理。

### 状态文件

服务器写入 `.gstack/browse.json`（通过 tmp + rename 的原子写入，模式 0o600）：

```json
{ "pid": 12345, "port": 34567, "token": "uuid-v4", "startedAt": "...", "binaryVersion": "abc123" }
```

CLI 读取此文件以找到服务器。如果文件丢失或服务器无法通过 HTTP 健康检查，CLI 生成一个新服务器。在 Windows 上，Bun 二进制文件中基于 PID 的进程检测不可靠，所以健康检查（GET /health）是所有平台上的主要活跃性信号。

### 端口选择

10000-60000 之间的随机端口（碰撞时重试最多 5 次）。这意味着 10 个 Conductor 工作区可以各自运行自己的浏览器守护进程，零配置，零端口冲突。旧方法（扫描 9400-9409）在多工作区设置中经常崩溃。

### 版本自动重启

构建将 `git rev-parse HEAD` 写入 `browse/dist/.version`。每次 CLI 调用时，如果二进制的版本与运行服务器的 `binaryVersion` 不匹配，CLI 杀死旧服务器并启动一个新的。这完全防止了"陈旧二进制"类别的错误——重新构建二进制，下一个命令会自动获取它。

## 安全模型

### 仅限本地主机

HTTP 服务器绑定到 `localhost`，而不是 `0.0.0.0`。它不可从网络访问。

### Bearer 令牌认证

每个服务器会话生成一个随机 UUID 令牌，写入状态文件，模式 0o600（仅所有者读取）。每个 HTTP 请求必须包括 `Authorization: Bearer <token>`。如果令牌不匹配，服务器返回 401。

这可以防止同一台机器上的其他进程与你的浏览器服务器通话。Cookie 选择器 UI（`/cookie-picker`）和健康检查（`/health`）被豁免——它们仅限于本地主机，不执行命令。

### Cookie 安全

Cookies 是 gstack 处理的最敏感的数据。设计如下：

1. **Keychain 访问需要用户批准。** 各个浏览器首次 cookie 导入触发 macOS Keychain 对话框。用户必须点击"允许"或"始终允许"。gstack 永远不会静默访问凭证。

2. **解密在进程内发生。** Cookie 值在内存中解密（PBKDF2 + AES-128-CBC），加载到 Playwright 上下文中，永远不会以纯文本写入磁盘。Cookie 选择器 UI 永远不显示 cookie 值——仅显示域名和计数。

3. **数据库是只读的。** gstack 将 Chromium cookie DB 复制到临时文件（以避免与运行的浏览器的 SQLite 锁冲突）并以只读方式打开它。它永远不会修改你的真实浏览器的 cookie 数据库。

4. **密钥缓存是按会话的。** Keychain 密码 + 派生的 AES 密钥在内存中缓存以供服务器的生命周期使用。当服务器关闭（空闲超时或显式停止）时，缓存消失。

5. **日志中没有 cookie 值。** 控制台、网络和对话框日志永远不包含 cookie 值。`cookies` 命令输出 cookie 元数据（域、名称、过期），但值被截断。

### Shell 注入防护

浏览器注册表（Comet、Chrome、Arc、Brave、Edge）是硬编码的。数据库路径是从已知常量构造的，永远不是从用户输入。Keychain 访问使用 `Bun.spawn()` 与显式参数数组，不是 shell 字符串插值。

## ref 系统

Refs（`@e1`、`@e2`、`@c1`）是智能体如何寻址页面元素，而不用编写 CSS 选择器或 XPath。

### 它如何工作

```
1. 智能体运行: $B snapshot -i
2. 服务器调用 Playwright 的 page.accessibility.snapshot()
3. 解析器遍历 ARIA 树，分配顺序 refs: @e1, @e2, @e3...
4. 对于每个 ref，构建一个 Playwright Locator: getByRole(role, { name }).nth(index)
5. 在 BrowserManager 实例上存储 Map<string, RefEntry>（role + name + Locator）
6. 将注释的树返回为纯文本

稍后：
7. 智能体运行: $B click @e3
8. 服务器解析 @e3 → Locator → locator.click()
```

### 为什么是 Locators，而不是 DOM 变异

明显的方法是将 `data-ref="@e1"` 属性注入 DOM。这在以下情况下会崩溃：

- **CSP（内容安全政策）。** 许多生产网站阻止从脚本进行的 DOM 修改。
- **React/Vue/Svelte hydration。** 框架协调可以删除注入的属性。
- **Shadow DOM。** 不能从外部到达 shadow roots 内部。

Playwright Locators 外部于 DOM。它们使用可访问性树（Chromium 在内部维护）和 `getByRole()` 查询。没有 DOM 变异，没有 CSP 问题，没有框架冲突。

### Ref 生命周期

Refs 在导航时被清除（主框架上的 `framenavigated` 事件）。这是正确的——导航后，所有定位器都已过时。智能体必须再次运行 `snapshot` 以获得新鲜的 refs。这是有意的：过时的 refs 应该大声失败，而不是点击错误的元素。

### Ref 陈旧性检测

SPAs 可以在不触发 `framenavigated` 的情况下改变 DOM（例如 React 路由器转换、标签页切换、模态打开）。这使得 refs 过时，即使页面 URL 没有改变。为了捕捉这一点，`resolveRef()` 在使用任何 ref 之前执行异步 `count()` 检查：

```
resolveRef(@e3) → entry = refMap.get("e3")
                → count = await entry.locator.count()
                → if count === 0: throw "Ref @e3 已过时——元素不再存在。运行 'snapshot' 以获取新鲜 refs。"
                → if count > 0: return { locator }
```

这会快速失败（~5ms 开销），而不是让 Playwright 的 30 秒操作超时在缺失的元素上过期。`RefEntry` 存储 `role` 和 `name` 元数据以及 Locator，所以错误消息可以告诉智能体元素是什么。

### 光标交互式 refs（@c）

`-C` 标志查找可点击但不在 ARIA 树中的元素——诸如用 `cursor: pointer` 样式的东西、带有 `onclick` 属性的元素或自定义 `tabindex`。这些在单独的命名空间中获得 `@c1`、`@c2` refs。这捕捉了框架渲染为 `<div>` 但实际上是按钮的自定义组件。

## 日志架构

三个环形缓冲区（每个 50,000 个条目，O(1) 推送）：

```
浏览器事件 → CircularBuffer (内存中) → 异步刷新到 .gstack/*.log
```

控制台消息、网络请求和对话框事件各自有自己的缓冲区。刷新每 1 秒发生一次——服务器仅追加自上次刷新以来的新条目。这意味着：

- HTTP 请求处理永远不会被磁盘 I/O 阻塞
- 日志幸存于服务器崩溃（最多 1 秒数据损失）
- 内存是有界的（50K 条目 × 3 个缓冲区）
- 磁盘文件是仅追加的，可由外部工具读取

`console`、`network` 和 `dialog` 命令从内存缓冲区而不是磁盘读取。磁盘文件用于事后调试。

## SKILL.md 模板系统

### 问题

SKILL.md 文件告诉 Claude 如何使用浏览器命令。如果文档列出一个不存在的标志，或错过添加的命令，智能体会遇到错误。手维护的文档总是会漂移。

### 解决方案

```
SKILL.md.tmpl          (人工编写的散文 + 占位符)
       ↓
gen-skill-docs.ts      (读取源代码元数据)
       ↓
SKILL.md               (已提交，自动生成的部分)
```

模板包含需要人类判断的工作流、提示和示例。占位符在构建时从源代码填充：

| 占位符 | 源 | 它生成什么 |
|--------|-----|-----------|
| `{{COMMAND_REFERENCE}}` | `commands.ts` | 分类命令表 |
| `{{SNAPSHOT_FLAGS}}` | `snapshot.ts` | 带有示例的标志参考 |
| `{{PREAMBLE}}` | `gen-skill-docs.ts` | 启动块：更新检查、会话跟踪、贡献者模式、AskUserQuestion 格式 |
| `{{BROWSE_SETUP}}` | `gen-skill-docs.ts` | 二进制发现 + 设置说明 |
| `{{BASE_BRANCH_DETECT}}` | `gen-skill-docs.ts` | 动态基础分支检测用于 PR 目标技能（ship、review、qa、plan-ceo-review） |
| `{{QA_METHODOLOGY}}` | `gen-skill-docs.ts` | /qa 和 /qa-only 的共享 QA 方法论块 |
| `{{DESIGN_METHODOLOGY}}` | `gen-skill-docs.ts` | /plan-design-review 和 /design-review 的共享设计审计方法论 |
| `{{REVIEW_DASHBOARD}}` | `gen-skill-docs.ts` | /ship 预检的审查就绪仪表盘 |
| `{{TEST_BOOTSTRAP}}` | `gen-skill-docs.ts` | 测试框架检测、引导、CI/CD 设置用于 /qa、/ship、/design-review |
| `{{CODEX_PLAN_REVIEW}}` | `gen-skill-docs.ts` | 可选的跨模型计划审查（Codex 或 Claude 子智能体后备）用于 /plan-ceo-review 和 /plan-eng-review |
| `{{DESIGN_SETUP}}` | `resolvers/design.ts` | `$D` 设计二进制的发现模式，镜像 `{{BROWSE_SETUP}}` |
| `{{DESIGN_SHOTGUN_LOOP}}` | `resolvers/design.ts` | /design-shotgun、/plan-design-review、/design-consultation 的共享比较板反馈循环 |

这在结构上是合理的——如果命令存在于代码中，它会出现在文档中。如果它不存在，它就不能出现。

### 前言

每个技能都以 `{{PREAMBLE}}` 块开始，它在技能自己的逻辑之前运行。它在单个 bash 命令中处理五件事：

1. **更新检查** ——调用 `gstack-update-check`，报告升级是否可用。
2. **会话跟踪** ——触及 `~/.gstack/sessions/$PPID` 并计数活跃会话（在过去 2 小时内修改的文件）。当 3+ 个会话运行时，所有技能进入"ELI16 模式"——每个问题都重新基础化用户的背景，因为他们在搞窗口。
3. **操作自我改进** ——在每个技能会话的结束，智能体反思失败（CLI 错误、错误的方法、项目怪癖）并将操作学习记录到项目的 JSONL 文件以供未来会话使用。
4. **AskUserQuestion 格式** ——通用格式：背景、问题、`建议：选择 X 因为 ___`、字母选项。一致贯穿所有技能。
5. **先搜索再构建** ——在构建基础设施或不熟悉的模式之前，先搜索。三层知识：久经考验（第 1 层）、新和流行（第 2 层）、第一原理（第 3 层）。当第一原理推理揭示传统智慧是错误时，智能体将"灵感时刻"命名并日志记录。详见 `ETHOS.md` 以了解完整的构建者哲学。

### 为什么已提交，而不是在运行时生成？

三个原因：

1. **Claude 在技能加载时读取 SKILL.md。** 没有构建步骤当用户调用 `/browse`。文件必须已经存在并且正确。
2. **CI 可以验证新鲜性。** `gen:skill-docs --dry-run` + `git diff --exit-code` 在合并前捕捉过时文档。
3. **Git blame 有效。** 你可以看到命令何时被添加，在哪个提交中。

### 模板测试层

| 层 | 什么 | 成本 | 速度 |
|----|------|------|------|
| 1 ——静态验证 | 解析每个 `$B` 命令在 SKILL.md 中，针对注册表验证 | 免费 | <2s |
| 2 ——通过 `claude -p` 的 E2E | 生成真实 Claude 会话，运行每个技能，检查错误 | ~$3.85 | ~20分钟 |
| 3 ——LLM 作为判官 | Sonnet 根据清晰度/完整性/可行性对文档评分 | ~$0.15 | ~30s |

第 1 层在每个 `bun test` 上运行。第 2+3 层在 `EVALS=1` 后面有门控。这个想法是：免费捕捉 95% 的问题，只对判断调用使用 LLMs。

## 命令分派

命令按副作用分类：

- **READ**（text、html、links、console、cookies、...）：无变异。安全重试。返回页面状态。
- **WRITE**（goto、click、fill、press、...）：改变页面状态。不是幂等的。
- **META**（snapshot、screenshot、tabs、chain、...）：服务器级操作，不完全适应读/写。

这不仅仅是组织。服务器用它来分派：

```typescript
if (READ_COMMANDS.has(cmd))  → handleReadCommand(cmd, args, bm)
if (WRITE_COMMANDS.has(cmd)) → handleWriteCommand(cmd, args, bm)
if (META_COMMANDS.has(cmd))  → handleMetaCommand(cmd, args, bm, shutdown)
```

`help` 命令返回所有三个集合，所以智能体可以自我发现可用的命令。

## 错误哲学

错误是给智能体的，不是人。每条错误消息必须是可操作的：

- "元素未找到" → "元素未找到或不可交互。运行 `snapshot -i` 以查看可用元素。"
- "选择器匹配多个元素" → "选择器匹配多个元素。改用 `snapshot` 中的 @refs。"
- 超时 → "导航在 30 秒后超时。页面可能缓慢或 URL 可能错误。"

Playwright 的原生错误通过 `wrapError()` 重写以去除内部堆栈跟踪并添加指导。智能体应该能够读取错误并知道接下来做什么，而不需要人工干预。

### 崩溃恢复

服务器不尝试自我修复。如果 Chromium 崩溃（`browser.on('disconnected')`），服务器立即退出。CLI 在下一个命令上检测到死服务器并自动重启。这比尝试重新连接到半死的浏览器进程更简单、更可靠。

## E2E 测试基础设施

### 会话运行器（`test/helpers/session-runner.ts`）

E2E 测试将 `claude -p` 作为完全独立的子进程生成——不通过无法在 Claude Code 会话内嵌套的 Agent SDK。运行器：

1. 将提示写入临时文件（避免 shell 转义问题）
2. 生成 `sh -c 'cat prompt | claude -p --output-format stream-json --verbose'`
3. 从 stdout 流式 NDJSON 以获得实时进展
4. 针对可配置的超时进行竞速
5. 将完整的 NDJSON 记录解析为结构化结果

`parseNDJSON()` 函数是纯的——没有 I/O，没有副作用——使其独立可测试。

### 可观测性数据流

```
  skill-e2e-*.test.ts
        │
        │ 生成 runId，将 testName + runId 传递给每个调用
        │
  ┌─────┼──────────────────────────────┐
  │     │                              │
  │  runSkillTest()              evalCollector
  │  (session-runner.ts)         (eval-store.ts)
  │     │                              │
  │  每个工具调用:               每个 addTest():
  │  ┌──┼──────────┐              savePartial()
  │  │  │          │                   │
  │  ▼  ▼          ▼                   ▼
  │ [HB] [PL]    [NJ]          _partial-e2e.json
  │  │    │        │             (原子覆盖)
  │  │    │        │
  │  ▼    ▼        ▼
  │ e2e-  prog-  {name}
  │ live  ress   .ndjson
  │ .json .log
  │
  │  失败时:
  │  {name}-failure.json
  │
  │  所有文件在 ~/.gstack-dev/
  │  运行目录: e2e-runs/{runId}/
  │
  │         eval-watch.ts
  │              │
  │        ┌─────┴─────┐
  │     读 HB     读部分
  │        └─────┬─────┘
  │              ▼
  │        渲染仪表盘
  │        (过时 >10分钟? 警告)
```

**分割所有权：** session-runner 所有心跳（当前测试状态），eval-store 所有部分结果（已完成测试状态）。观察者读两者。两个组件彼此不了解——它们只通过文件系统共享数据。

**一切非致命的：** 所有可观测性 I/O 都包装在 try/catch 中。写入失败永远不会导致测试失败。测试本身是真实来源；可观测性是尽力而为。

**机器可读诊断：** 每个测试结果包括 `exit_reason`（成功、超时、error_max_turns、error_api、exit_code_N）、`timeout_at_turn` 和 `last_tool_call`。这启用 `jq` 查询，如：
```bash
jq '.tests[] | select(.exit_reason == "timeout") | .last_tool_call' ~/.gstack-dev/evals/_partial-e2e.json
```

### 评估持久化（`test/helpers/eval-store.ts`）

`EvalCollector` 累积测试结果并以两种方式写入：

1. **增量式：** `savePartial()` 在每个测试后写入 `_partial-e2e.json`（原子：写 `.tmp`、`fs.renameSync`）。幸存于杀死。
2. **最终的：** `finalize()` 写入一个时间戳的评估文件（例如 `e2e-20260314-143022.json`）。部分文件永不清理——它与最终文件一起保留供可观测性使用。

`eval:compare` 比较两个评估运行。`eval:summary` 聚合 `~/.gstack-dev/evals/` 中所有运行的统计数据。

### 测试层

| 层 | 什么 | 成本 | 速度 |
|----|------|------|------|
| 1 ——静态验证 | 解析 `$B` 命令、根据注册表验证、可观测性单元测试 | 免费 | <5s |
| 2 ——通过 `claude -p` 的 E2E | 生成真实 Claude 会话，运行每个技能，扫描错误 | ~$3.85 | ~20分钟 |
| 3 ——LLM 作为判官 | Sonnet 根据清晰度/完整性/可行性对文档评分 | ~$0.15 | ~30s |

第 1 层在每个 `bun test` 上运行。第 2+3 层在 `EVALS=1` 后面有门控。这个想法：免费捕捉 95% 的问题，只对判断调用使用 LLMs。

## 有意不在这里的东西

- **没有 WebSocket 流。** HTTP 请求/响应更简单，可用 curl 调试，速度足够快。流式传输会添加边际收益的复杂性。
- **没有 MCP 协议。** MCP 为每个请求添加 JSON 模式开销，需要持久连接。纯 HTTP + 纯文本输出在令牌上更轻，更容易调试。
- **没有多用户支持。** 每个工作区一个服务器，一个用户。令牌认证是深度防御，不是多租户。
- **没有 Windows/Linux cookie 解密。** macOS Keychain 是唯一受支持的凭证存储。Linux（GNOME Keyring/kwallet）和 Windows（DPAPI）在架构上是可能的，但未实现。
- **没有 iframe 自动发现。** `$B frame` 支持跨框架交互（CSS 选择器、@ref、`--name`、`--url` 匹配），但 ref 系统不会在 `snapshot` 期间自动爬网 iframes。你必须首先显式进入框架上下文。
