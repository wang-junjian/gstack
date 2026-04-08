# 待做事项

## 侧边栏安全

### ML 提示注入分类器

**什么：** 通过 @huggingface/transformers v4（WASM 后端）添加 DeBERTa-v3-base-prompt-injection-v2 作为 Chrome 侧边栏的 ML 防御层。可重用的 `browse/src/security.ts` 模块，包含 `checkInjection()` API。包括金丝雀令牌、攻击日志、盾牌图标、特殊遥测（检测到即使关闭遥测时也询问 AskUserQuestion）和 BrowseSafe-bench 红队测试框架（来自 Perplexity 的 3,680 个对抗性案例）。

**为什么：** PR 1 修复了架构（命令允许列表、XML 框架、Opus 默认值）。但攻击者仍然可以诱骗 Claude 导航到钓鱼网站或通过允许的浏览命令泄露可见的页面数据。ML 分类器捕获架构控制看不到的提示注入模式。94.8% 准确度，99.6% 召回率，通过 WASM 进行约 50-100ms 推理。深度防御。

**背景：** 完整设计文档，包括行业研究、开源工具景观、Codex 审查发现和雄心勃勃的 Bun 原生愿景（通过 FFI + Apple Accelerate 进行 5ms 推理）：[`docs/designs/ML_PROMPT_INJECTION_KILLER.md`](docs/designs/ML_PROMPT_INJECTION_KILLER.md)。CEO 计划，包含范围决策：`~/.gstack/projects/garrytan-gstack/ceo-plans/2026-03-28-sidebar-prompt-injection-defense.md`。

**努力：** L（人工：~2 周 / CC：~3-4 小时）
**优先级：** P0
**依赖：** 侧边栏安全修复 PR（命令允许列表 + XML 框架 + arg 修复）首先着陆

## 构建者精神

### 首次搜索前构建介绍

**什么：** 添加一个 `generateSearchIntro()` 函数（如 `generateLakeIntro()`），在首次使用时介绍搜索前构建原则，并链接到博客文章。

**为什么：** "沸腾这个湖"有一个介绍流程，链接到文章并标记 `.completeness-intro-seen`。搜索前构建应该有相同的模式用于可发现性。

**背景：** 被阻止在博客文章链接上。当文章存在时，使用 `.search-intro-seen` 标记文件添加介绍流程。模式：`generateLakeIntro()` 在 gen-skill-docs.ts:176。

**努力：** S
**优先级：** P2
**依赖：** 关于搜索前构建的博客文章

## Chrome DevTools MCP 集成

### 真实 Chrome 会话访问

**什么：** 集成 Chrome DevTools MCP 以连接到用户的真实 Chrome 会话，包括真实 Cookie、真实状态，没有 Playwright 中间人。

**为什么：** 现在，有头模式启动全新的 Chromium 配置文件。用户必须手动登录或导入 Cookie。Chrome DevTools MCP 连接到用户的实际 Chrome...即时访问每个认证网站。这是浏览器自动化 AI 智能体的未来。

**背景：** Google 在 Chrome 146+（2025 年 6 月）中发布了 Chrome DevTools MCP。它提供截图、控制台消息、性能跟踪、Lighthouse 审计和通过用户的真实浏览器完整页面交互。gstack 应该使用它进行真实会话访问，同时保持 Playwright 用于无头 CI/测试工作流。

可能的新技能：
- `/debug-browser`：使用源映射堆栈跟踪的 JS 错误跟踪
- `/perf-debug`：性能跟踪、Core Web Vitals、网络瀑布

可能会替换 `/setup-browser-cookies` 在大多数用例中，因为用户的真实 Cookie 已经存在。

**努力：** L（人工：~2 周 / CC：~2 小时）
**优先级：** P0
**依赖：** Chrome 146+、安装的 DevTools MCP 服务器

## 浏览

### 将 server.ts 捆绑到已编译的二进制文件中

**什么：** 完全消除 `resolveServerScript()` 回退链 — 将 server.ts 捆绑到已编译的 browse 二进制文件中。

**为什么：** 当前的回退链（检查邻近 cli.ts、检查全局安装）很脆弱，在 v0.3.2 中导致了错误。单个已编译的二进制文件更简单、更可靠。

**背景：** Bun 的 `--compile` 标志可捆绑多个入口点。服务器当前在运行时通过文件路径查找解析。捆绑它完全消除了解析步骤。

**努力：** M
**优先级：** P2
**依赖：** 无

### 会话（隔离的浏览器实例）

**什么：** 隔离的浏览器实例，具有单独的 Cookie/存储/历史记录，可按名称寻址。

**为什么：** 启用不同用户角色的并行测试、A/B 测试验证和干净的身份验证状态管理。

**背景：** 需要 Playwright 浏览器上下文隔离。每个会话获得自己的上下文，具有独立的 Cookie/localStorage。视频录制的前提条件（干净的上下文生命周期）和身份验证保管库。

**努力：** L
**优先级：** P3

### 视频录制

**什么：** 录制浏览器交互作为视频（开始/停止控制）。

**为什么：** QA 报告和 PR 体中的视频证据。目前延迟，因为 `recreateContext()` 破坏页面状态。

**背景：** 需要会话用于干净的上下文生命周期。Playwright 支持每个上下文的视频录制。还需要 WebM → GIF 转换用于 PR 嵌入。

**努力：** M
**优先级：** P3
**依赖：** 会话

### v20 加密格式支持

**什么：** AES-256-GCM 支持未来 Chromium Cookie DB 版本（当前 v10）。

**为什么：** 未来 Chromium 版本可能会更改加密格式。主动支持防止破损。

**努力：** S
**优先级：** P3

## 发送

### GitLab 支持用于 /land-and-deploy

**什么：** 为 `/land-and-deploy` 技能添加 GitLab MR 合并 + CI 轮询支持。目前使用 `gh pr view`、`gh pr checks`、`gh pr merge` 和 `gh run list/view` 在 15+ 个地方 — 每个都需要使用 `glab ci status`、`glab mr merge` 等的 GitLab 条件路径。

**为什么：** 没有这个，GitLab 用户可以 `/ship`（创建 MR）但不能 `/land-and-deploy`（合并 + 验证）。完成 GitLab 故事端到端。

**背景：** `/retro`、`/ship` 和 `/document-release` 现在通过多平台 `BASE_BRANCH_DETECT` 解析器支持 GitLab。`/land-and-deploy` 具有更深层次的 GitHub 特定语义（合并队列、通过 `gh pr checks` 的必需检查、部署工作流轮询），在 GitLab 上具有不同的形状。`glab` CLI（v1.90.0）支持 `glab mr merge`、`glab ci status`、`glab ci view`，但格式不同，没有合并队列概念。

**努力：** L
**优先级：** P2
**依赖：** 无（多平台 `BASE_BRANCH_DETECT` 解析器已经完成）

### 多提交 CHANGELOG 完整性评估

**什么：** 添加一个定期 E2E 评估，创建一个包含 5+ 次提交的分支，跨越 3+ 个主题（功能、清理、基础设施），运行 /ship 的第 5 步 CHANGELOG 生成，验证 CHANGELOG 提及所有主题。

**为什么：** v0.11.22 中修复的错误（garrytan/ship-full-commit-coverage）显示 /ship 的 CHANGELOG 生成在长分支上偏向于最近提交。提示修复添加了交叉检查，但没有测试文件测试多提交失败模式。现有的 `ship-local-workflow` E2E 仅使用单提交分支。

**背景：** 会是一个 `periodic` 层测试（~$4/运行，非确定性，因为它测试 LLM 指令遵循）。设置：创建裸远程、克隆、在功能分支上的不同主题上添加 5+ 提交，通过 `claude -p` 运行第 5 步，验证 CHANGELOG 输出覆盖所有主题。模式：`ship-local-workflow` 在 `test/skill-e2e-workflow.test.ts`。

**努力：** M
**优先级：** P3
**依赖：** 无

### 发布日志 — 持久的 /ship 运行记录

**什么：** 在每个 /ship 运行结束时将结构化 JSON 项追加到 `.gstack/ship-log.json`（版本、日期、分支、PR URL、审查发现、Greptile 统计、完成的待做事项、测试结果）。

**为什么：** /retro 没有关于发布速度的结构化数据。发布日志启用：每周的 PRs 趋势、审查发现率、Greptile 信号随时间、测试套件增长。

**背景：** /retro 已经读取 greptile-history.md — 相同的模式。评估持久化（eval-store.ts）显示 JSON 追加模式存在于代码库中。~15 行在发布模板中。

**努力：** S
**优先级：** P2
**依赖：** 无

### PR 体中的视觉验证与截图

**什么：** /ship 第 7.5 步：推送后截图关键页面，嵌入到 PR 体中。

**为什么：** PR 中的视觉证据。审查官可以看到不部署本地就发生了什么。

**背景：** 第 3.6 阶段的一部分。需要 S3 上传用于图像托管。

**努力：** M
**优先级：** P2
**依赖：** /setup-gstack-upload

## 审查

### 内联 PR 注释

**什么：** /ship 和 /review 使用 `gh api` 在特定文件:行位置发布内联审查评论，以创建拉取请求审查评论。

**为什么：** 行级别注释比顶级注释更可操作。PR 线程变成 Greptile、Claude 和人工审查官之间的逐行对话。
