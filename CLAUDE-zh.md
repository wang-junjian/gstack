# gstack 开发

## 命令

```bash
bun install          # 安装依赖
bun test             # 运行免费测试（浏览器 + 快照 + 技能验证）
bun run test:evals   # 运行付费评估：LLM 判官 + E2E（基于差异，~$4/run 最大）
bun run test:evals:all  # 运行所有付费评估，不论差异
bun run test:gate    # 只运行门控层测试（CI 默认，阻塞合并）
bun run test:periodic  # 只运行周期层测试（每周 cron/手动）
bun run test:e2e     # 只运行 E2E 测试（基于差异，~$3.85/run 最大）
bun run test:e2e:all # 运行所有 E2E 测试，不论差异
bun run eval:select  # 显示根据当前差异哪些测试会运行
bun run dev <cmd>    # 在开发模式运行 CLI，例如 bun run dev goto https://example.com
bun run build        # 生成文档 + 编译二进制文件
bun run gen:skill-docs  # 从模板重新生成 SKILL.md 文件
bun run skill:check  # 技能的健康仪表盘
bun run dev:skill    # 监测模式：变更时自动重新生成 + 验证
bun run eval:list    # 列出来自 ~/.gstack-dev/evals/ 的所有评估运行
bun run eval:compare # 比较两个评估运行（自动选择最新的）
bun run eval:summary # 聚合跨所有评估运行的统计数据
```

`test:evals` 需要 `ANTHROPIC_API_KEY`。Codex E2E 测试（`test/codex-e2e.test.ts`）
使用 Codex 自己的认证来自 `~/.codex/` 配置——不需要 `OPENAI_API_KEY` 环境变量。
E2E 测试实时流进度（通过 `--output-format stream-json --verbose` 的工具）。结果持久化到 `~/.gstack-dev/evals/` 带自动比较
对上一个运行。

**基于差异的测试选择：** `test:evals` 和 `test:e2e` 根据
`git diff` 对基础分支自动选择测试。每个测试在 `test/helpers/touchfiles.ts` 中声明它的文件依赖。
对全局 touchfiles（session-runner、eval-store、touchfiles.ts 本身）的改变触发所有测试。使用 `EVALS_ALL=1` 或 `:all` 脚本
变体强制所有测试。运行 `eval:select` 预览哪些测试会运行。

**两层系统：** 测试在 `E2E_TIERS` 分类为 `gate` 或 `periodic`
（在 `test/helpers/touchfiles.ts`）。CI 只运行门控测试（`EVALS_TIER=gate`）；
周期测试每周通过 cron 或手动运行。使用 `EVALS_TIER=gate` 或
`EVALS_TIER=periodic` 过滤。当添加新 E2E 测试时，分类它们：
1. 安全护栏或确定性功能测试？-> `gate`
2. 质量基准、Opus 模型测试或非确定性？-> `periodic`
3. 需要外部服务（Codex、Gemini）？-> `periodic`

## 测试

```bash
bun test             # 在每次提交前运行——免费，<2s
bun run test:evals   # 运送前运行——付费，基于差异（~$4/run 最大）
```

`bun test` 运行技能验证、gen-skill-docs 质量检查和浏览器
集成测试。`bun run test:evals` 运行 LLM 判官质量评估和 E2E
测试通过 `claude -p`。两者都必须通过才能创建 PR。

## 项目结构

```
gstack/
├── browse/          # 无头浏览器 CLI (Playwright)
│   ├── src/         # CLI + 服务器 + 命令
│   │   ├── commands.ts  # 命令注册表（单一真实来源）
│   │   └── snapshot.ts  # SNAPSHOT_FLAGS 元数据数组
│   ├── test/        # 集成测试 + 夹具
│   └── dist/        # 编译的二进制文件
├── hosts/           # 类型化的主机配置（每个智能体一个）
│   ├── claude.ts    # 主要主机配置
│   ├── codex.ts, factory.ts, kiro.ts  # 现有的主机
│   ├── opencode.ts, slate.ts, cursor.ts, openclaw.ts  # 新主机
│   └── index.ts     # 注册表：导出所有、推导主机类型
├── scripts/         # 构建 + DX 工具
│   ├── gen-skill-docs.ts  # 模板 → SKILL.md 生成器（配置驱动）
│   ├── host-config.ts     # HostConfig 接口 + 验证器
│   ├── host-config-export.ts  # 安装脚本的 Shell 桥接
│   ├── host-adapters/     # 主机特定适配器（OpenClaw 工具映射）
│   ├── resolvers/   # 模板解析器模块（前言、设计、审查等）
│   ├── skill-check.ts     # 健康仪表盘
│   └── dev-skill.ts       # 监测模式
├── test/            # 技能验证 + 评估测试
│   ├── helpers/     # skill-parser.ts、session-runner.ts、llm-judge.ts、eval-store.ts
│   ├── fixtures/    # 已知真实 JSON、种植的错误夹具、评估基准
│   ├── skill-validation.test.ts  # 第 1 层：静态验证（免费，<1s）
│   ├── gen-skill-docs.test.ts    # 第 1 层：生成器质量（免费，<1s）
│   ├── skill-llm-eval.test.ts   # 第 3 层：LLM 作为判官（~$0.15/run）
│   └── skill-e2e-*.test.ts       # 第 2 层：E2E 通过 claude -p（~$3.85/run，按类别分割）
├── qa-only/         # /qa-only 技能（仅报告 QA，无修复）
├── plan-design-review/  # /plan-design-review 技能（仅报告设计审计）
├── design-review/    # /design-review 技能（设计审计 + 修复循环）
├── ship/            # Ship 工作流技能
├── review/          # PR 审查技能
├── plan-ceo-review/ # /plan-ceo-review 技能
├── plan-eng-review/ # /plan-eng-review 技能
├── autoplan/        # /autoplan 技能（自动审查管道：CEO → 设计 → 工程）
├── benchmark/       # /benchmark 技能（性能回归检测）
├── canary/          # /canary 技能（部署后监控循环）
├── codex/           # /codex 技能（通过 OpenAI Codex CLI 多 AI 第二意见）
├── land-and-deploy/ # /land-and-deploy 技能（合并 → 部署 → canary 验证）
├── office-hours/    # /office-hours 技能（YC Office Hours——创业诊断 + 构建者头脑风暴）
├── investigate/     # /investigate 技能（系统根本原因调试）
├── retro/           # 回顾技能（包括 /retro 全局跨项目模式）
├── bin/             # CLI 工具（gstack-repo-mode、gstack-slug、gstack-config 等）
├── document-release/ # /document-release 技能（运送后文档更新）
├── cso/             # /cso 技能（OWASP Top 10 + STRIDE 安全审计）
├── design-consultation/ # /design-consultation 技能（从零开始设计系统）
├── design-shotgun/  # /design-shotgun 技能（视觉设计探索）
├── open-gstack-browser/  # /open-gstack-browser 技能（启动 GStack 浏览器）
├── connect-chrome/  # symlink → open-gstack-browser（向后兼容）
├── design/          # 设计 CLI 二进制文件（GPT Image API）
│   ├── src/         # CLI + 命令（生成、变体、比较、serve 等）
│   ├── test/        # 集成测试
│   └── dist/        # 编译的二进制文件
├── extension/       # Chrome 扩展（side panel + 活动源 + CSS 检查器）
├── lib/             # 共享库（worktree.ts）
├── docs/designs/    # 设计文档
├── setup-deploy/    # /setup-deploy 技能（一次部署配置）
├── .github/         # CI 工作流 + Docker 镜像
│   ├── workflows/   # evals.yml（Ubicloud 上的 E2E）、skill-docs.yml、actionlint.yml
│   └── docker/      # Dockerfile.ci（预烤工具链 + Playwright/Chromium）
├── contrib/         # 仅贡献者工具（从不为用户安装）
│   └── add-host/    # /gstack-contrib-add-host 技能
├── setup            # 一次设置：构建二进制 + symlink 技能
├── SKILL.md         # 从 SKILL.md.tmpl 生成（不要直接编辑）
├── SKILL.md.tmpl    # 模板：编辑这个，运行 gen:skill-docs
├── ETHOS.md         # 构建者哲学（Boil the Lake、Search Before Building）
└── package.json     # 浏览器的构建脚本
```

## SKILL.md 工作流

SKILL.md 文件是**从 `.tmpl` 模板生成的**。要更新文档：

1. 编辑 `.tmpl` 文件（例如 `SKILL.md.tmpl` 或 `browse/SKILL.md.tmpl`）
2. 运行 `bun run gen:skill-docs`（或 `bun run build`，它自动做）
3. 提交 `.tmpl` 和生成的 `.md` 文件

要添加一个新的浏览器命令：添加它到 `browse/src/commands.ts` 并重建。
要添加一个快照标志：添加它到 `snapshot.ts` 中的 `SNAPSHOT_FLAGS` 并重建。

**SKILL.md 文件的合并冲突：** 永远不要通过接受任一方解决生成 SKILL.md
文件的冲突。相反：(1) 解决 `.tmpl` 模板上的冲突
和 `scripts/gen-skill-docs.ts`（真实来源）、(2) 运行 `bun run gen:skill-docs`
重新生成所有 SKILL.md 文件、(3) 暂存重新生成的文件。接受一方的
生成输出默然删除另一方的模板改变。

## 平台无关设计

技能必须永远不要硬编码框架特定命令、文件模式或目录
结构。相反：

1. **读 CLAUDE.md** 用于项目特定配置（测试命令、评估命令等）
2. **如果缺失，AskUserQuestion** ——让用户告诉你或让 gstack 搜索 repo
3. **持久化答案到 CLAUDE.md** 所以我们永不需要再问

这适用于测试命令、评估命令、部署命令和任何其他
项目特定行为。项目拥有它的配置；gstack 读它。

## 编写 SKILL 模板

SKILL.md.tmpl 文件是**Claude 读的提示模板**，不是 bash 脚本。
每个 bash 代码块在单独的 shell 中运行——变量不在块之间持续。

规则：
- **对逻辑和状态使用自然语言。** 不要使用 shell 变量来传递
  块之间的状态。相反，告诉 Claude 要记住什么并在散文中参考
  它（例如"步骤 0 中检测的基础分支"）。
- **不要硬编码分支名称。** 通过
  `gh pr view` 或 `gh repo view` 动态检测 `main`/`master`/等。使用 `{{BASE_BRANCH_DETECT}}`
  对于 PR 目标技能。在散文中使用"基础分支"，代码块占位符中使用 `<base>`。
- **保持 bash 块自包含。** 每个代码块应该独立工作。
  如果块需要前一个步骤的上下文，在上面的散文中重新说明它。
- **表达条件为英文。** 不是在 bash 中嵌套 `if/elif/else`，
  写编号决策步骤："1. 如果 X，做 Y。2. 否则，做 Z。"

## 浏览器交互

当你需要与浏览器交互时（QA、狗粮测试、cookie 设置），使用
`/browse` 技能或直接通过 `$B <command>` 运行浏览器二进制。永远不要使用
`mcp__claude-in-chrome__*` 工具——它们缓慢、不可靠、不是本项目使用的。

**Side panel 架构：** 在修改 `sidepanel.js`、`background.js`、
`content.js`、`sidebar-agent.ts` 或 side panel 相关服务器端点之前，读
`docs/designs/SIDEBAR_MESSAGE_FLOW.md`。它文档化完整初始化
时间线、消息流、认证令牌链、标签页并发模型和已知
失败模式。Side panel 跨越 5 个文件在 2 个代码库（扩展 + 服务器）
带非明显的排序依赖。文档存在以防止默然失败种类
来自不理解跨组件流。

## Dev symlink 感知

当开发 gstack 时，`.claude/skills/gstack` 可能是一个 symlink 回
这个工作目录（gitignored）。这意味着技能改变是**立即实时的**，
很好快速迭代，在大重构期间有风险，半完成的技能
可能会打破其他使用 gstack 的 Claude Code 会话并发。

**检查一次每个会话：** 运行 `ls -la .claude/skills/gstack` 查看它是否是
symlink 或真实副本。如果它是 symlink 到你的工作目录，知晓：
- 模板改变 + `bun run gen:skill-docs` 立即影响所有 gstack 调用
- 对 SKILL.md.tmpl 文件的破坏改变可能会打破并发 gstack 会话
- 在大重构期间，移除 symlink（`rm .claude/skills/gstack`）所以全局
  安装在 `~/.claude/skills/gstack/` 被使用

**前缀设置：** 设置创建真实目录（不是 symlinks）在顶层
带 SKILL.md symlink 里面（例如 `qa/SKILL.md -> gstack/qa/SKILL.md`）。这
确保 Claude 发现它们作为顶层技能，不是嵌套在 `gstack/` 下。
名称要么简短（`qa`）要么有命名空间（`gstack-qa`），控制通过
`skill_prefix` 在 `~/.gstack/config.yaml`。通过 `--no-prefix` 或 `--prefix` 
跳过交互提示。

**注意：** 将 gstack 供应到项目的 repo 已废弃。使用全局安装
+ `./setup --team` 代替。见 README.md 用于团队模式说明。

**用于计划审查：** 当审查计划修改技能模板或
gen-skill-docs 管道时，考虑改变是否应该被隔离测试
在上线前（特别是用户在其他窗口中活跃使用 gstack 时）。

**升级迁移：** 当改变修改在磁盘上状态（目录结构、
配置格式、陈旧文件）以可能打破现有用户安装的方式，添加
迁移脚本到 `gstack-upgrade/migrations/`。读 CONTRIBUTING.md 的"升级
迁移"部分用于格式和测试要求。升级技能运行
这些自动在 `./setup` 后期间 `/gstack-upgrade`。

## 编译的二进制——永远不要提交 browse/dist/ 或 design/dist/

`browse/dist/` 和 `design/dist/` 目录包含编译的 Bun 二进制文件
（`browse`、`find-browse`、`design`、~58MB 每个）。这些是 Mach-O arm64 仅——它们
不工作在 Linux、Windows 或 Intel Macs。`./setup` 脚本已经从源为所有平台构建，
所以检查入的二进制文件是冗余的。它们由历史错误跟踪，应该最终被移除带
`git rm --cached`。

**永远不要暂存或提交这些文件。** 它们在 `git status` 出现为修改
因它们被跟踪尽管 `.gitignore` ——忽略它们。当暂存文件时，
总是使用特定文件名（`git add file1 file2`）——永远不要 `git add .` 或
`git add -A`，这会意外包括二进制。

## 提交样式

**总是二分提交。** 每个提交应该是单个逻辑改变。当
你已做多个改变（例如重命名 + 重写 + 新测试），在推前分割
它们为独立提交。每个提交应该独立
可理解和可还原。

好的二分例子：
- 重命名/移动独立于行为改变
- 测试基础设施（touchfiles、helpers）独立于测试实现
- 模板改变独立于生成文件重新生成
- 机械重构独立于新功能

当用户说"二分提交"或"二分和推"时，分割暂存/未暂存
改变为逻辑提交并推。

## 社区 PR 护栏

当审查或合并社区 PRs 时，**总是 AskUserQuestion** 在接受之前
任何承诺：

1. **触及 ETHOS.md** ——这个文件是 Garry 的个人构建者哲学。无编辑
   来自外部贡献者或 AI 智能体，句号。
2. **移除或软化推广材料** ——YC 参考、创始人透视
   和产品声音是有意的。框架化这些为"不必要"或
   "太推广性的" PRs 必须被拒绝。
3. **改变 Garry 的声音** ——技能模板中的音调、幽默、直接度和透视
   CHANGELOG 和文档不是通用的。重写声音 PRs 为更"中立"或"专业"必须被拒绝。

即使智能体坚强相信改变改进项目，这三个
类别需要显式用户批准通过 AskUserQuestion。无例外。
无自动合并。无"我会直接清理它。"

## CHANGELOG + VERSION 样式

**VERSION 和 CHANGELOG 是分支作用域的。** 每个船性功能分支得到它自己的
版本凹陷和 CHANGELOG 入口。入口描述了这个分支添加什么——
不是已在主控上的。

**何时写 CHANGELOG 入口：**
- 在 `/ship` 时间（步骤 5），不是开发期间或中支。
- 入口涵盖这个分支 vs 基础分支上的所有提交。
- 永不折叠新工作到现有 CHANGELOG 从前一个版本已
  登陆主控。如果主控有 v0.10.0.0 和你的分支添加功能，
  凹陷为 v0.10.1.0 带新入口——不编辑 v0.10.0.0 入口。

**关键问题在写前：**
1. 我在哪个分支？这个分支改变了什么？
2. 基础分支版本已最后一天了？（如果是，凹陷和创建新入口。）
3. 这个分支上现有入口已涵盖早期工作？（如果是，替换
   它带一个统一入口用于最终版本。）

**合并主控不意味着采纳主控版本。** 当你合并 origin/main 到
功能分支，主控可能带新 CHANGELOG 入口和更高 VERSION。你的分支
仍需它自己的版本凹陷在顶。如果主控在 v0.13.8.0 和你的分支添加
功能，凹陷为 v0.13.9.0 带新入口。永不卡你的改变到一个入口
已登陆主控。你的入口在顶前因你的分支登陆接下来。

**在合并主控后，总是检查：**
- CHANGELOG 有你的分支自己的入口，独立从主控入口？
- VERSION 更高于主控 VERSION？
- 你的入口最顶层入口在 CHANGELOG 中（在主控最新之上）？
如果任何答案是否，在继续前修复它。

**后任何 CHANGELOG 编辑移动、添加或移除入口，** 立即运行
`grep "^## \[" CHANGELOG.md` 并验证完整版本序列是连续的
无进展或重复在提交前。如果版本缺失，编辑
打破了什么。在移动前修复它。

CHANGELOG.md 是**用户的**，不是贡献者。写它像产品释放说明：

- 领先用户现在可以**做**什么那他们不能前。卖功能。
- 使用纯语言，不实现细节。"你现在可以..."不"重构了..."
- **永不提及 TODOS.md、内部跟踪、评估基础设施或贡献者面向
  细节。** 这些对用户隐形并毫无意义。
- 将贡献者/内部改变放到单独"贡献者"部分在底部。
- 每个入口应该使某人想"哦好，我想尝试那。"
- 无术语：说"每个问题现在告诉你哪个项目和分支你在"不
  "AskUserQuestion 格式标准化跨技能模板通过前言解析器。"

## AI 努力压缩

当估计或讨论努力时，总是显示人类团队和 CC+gstack 时间：

| 任务类型 | 人类团队 | CC+gstack | 压缩 |
|---------|---------|-----------|------|
| 样板/脚手架 | 2 天 | 15 分钟 | ~100x |
| 测试编写 | 1 天 | 15 分钟 | ~50x |
| 功能实现 | 1 周 | 30 分钟 | ~30x |
| 错误修复 + 回归测试 | 4 小时 | 15 分钟 | ~20x |
| 架构/设计 | 2 天 | 4 小时 | ~5x |
| 研究/探索 | 1 天 | 3 小时 | ~3x |

完整性便宜。不推荐快捷当完整实现
是"湖"（可达到）不"海"（多季度迁移）。看完整性
原理在技能前言用于完整构建者哲学。

## 搜索前构建

在设计任何涉及并发、不熟悉模式、
基础设施或任何其中运行时/框架可能有内置的地方：

1. 搜索"{runtime} {thing} built-in"
2. 搜索"{thing} best practice {当前年份}"
3. 检查官方运行时/框架文档

三层知识：久经考验（第 1 层）、新和流行（第 2 层）、
第一原理（第 3 层）。奖第 3 层高于一切。看 ETHOS.md 用于完整的
构建者哲学。

## 本地计划

贡献者可以存储长期视景文档和设计文档在 `~/.gstack-dev/plans/`。
这些是仅本地（不检查入）。当审查 TODOS.md 时，检查 `plans/` 用于当选
那可能准备好提升到 TODOs 或实现。

## E2E 评估失利责备协议

当 E2E 评估在 `/ship` 或任何其他工作流失败时，**永不宣称"不
与我们改变相关"不证明它。** 这些系统有隐形耦合——
前言文本改变影响智能体行为，新帮手改变时间，
重新生成 SKILL.md 移动提示背景。

**在将失败归咎于"已存在"前需要：**
1. 在主控（或基础分支）上运行相同评估并显示它失败那也
2. 如果它在主控通过但在分支失败——这是你的改变。追踪责备。
3. 如果你不能在主控运行，说"未验证——可能或可能不相关"并旗标它
   为 PR 正文的风险

"已存在"不带收据是懒惰主张。证明它或不说它。

## 长期任务：不放弃

当运行评估、E2E 测试或任何长期运行后台任务，**轮询到完成**。使用 `sleep 180 && echo "ready"` + `TaskOutput` 在每 3 个
分钟的循环。永远不要切换到阻塞模式并放弃当轮询超时。永远
说"我会被通知当它完成"并停止检查——保持循环去
直到任务完成或用户告诉你停止。

完整 E2E 套件可以需要 30-45 分钟。那是 10-15 轮询循环。做所有
它们。报告进度在每个检查（哪个测试通过、哪个运行、任何
失败所以远）。用户想看运行完成，不承诺
你稍后检查。

## E2E 测试夹具：提取，不复制

**永不复制完整 SKILL.md 文件到 E2E 测试夹具。** SKILL.md 文件是
1500-2000 行。当 `claude -p` 读一个文件那大，背景膨胀原因
超时、不易出现转向限制和测试那需要 5-10x 更长要比时间。

相反，提取仅测试实际需要的部分：

```typescript
// 坏——智能体读 1900 行、燃烧令牌在无关部分
fs.copyFileSync(path.join(ROOT, 'ship', 'SKILL.md'), path.join(dir, 'ship-SKILL.md'));

// 好——智能体读 ~60 行、在 38s 完成不是超时
const full = fs.readFileSync(path.join(ROOT, 'ship', 'SKILL.md'), 'utf-8');
const start = full.indexOf('## Review Readiness Dashboard');
const end = full.indexOf('\n---\n', start);
fs.writeFileSync(path.join(dir, 'ship-SKILL.md'), full.slice(start, end > start ? end : undefined));
```

也当运行针对 E2E 测试调试失败：
- 运行在**前台**（`bun test ...`），不在后台带 `&` 和 `tee`
- 永不 `pkill` 运行评估进程和重启——你输结果和浪费金钱
- 一个清洁运行打败三个被杀害和重启的运行

## 发布原生 OpenClaw 技能到 ClawHub

原生 OpenClaw 技能在 `openclaw/skills/gstack-openclaw-*/SKILL.md` 中。这些是
手工制作方法论技能（不由管道生成）发表到 ClawHub
所以任何 OpenClaw 用户能安装它们。

**发布：** 命令是 `clawhub publish`（不是 `clawhub skill publish`）：

```bash
clawhub publish openclaw/skills/gstack-openclaw-office-hours \
  --slug gstack-openclaw-office-hours --name "gstack Office Hours" \
  --version 1.0.0 --changelog "改变描述"
```

重复每个技能：`gstack-openclaw-ceo-review`、`gstack-openclaw-investigate`、
`gstack-openclaw-retro`。凹陷 `--version` 在每个更新。

**认证：** `clawhub login`（打开浏览器用于 GitHub 认证）。`clawhub whoami` 验证。

**更新：** 相同 `clawhub publish` 命令带更高 `--version` 和 `--changelog`。

**验证：** `clawhub search gstack` 确认它们在线。

## 部署到活跃技能

活跃技能在 `~/.claude/skills/gstack/` 中。后进行改变：

1. 推你的分支
2. 在技能目录中获取和重置：`cd ~/.claude/skills/gstack && git fetch origin && git reset --hard origin/main`
3. 重建：`cd ~/.claude/skills/gstack && bun run build`

或直接复制二进制：
- `cp browse/dist/browse ~/.claude/skills/gstack/browse/dist/browse`
- `cp design/dist/design ~/.claude/skills/gstack/design/dist/design`
