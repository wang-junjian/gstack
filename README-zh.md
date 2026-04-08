# gstack

> "我觉得可能从 12 月以来基本上就没有写过一行代码，这是一个非常大的变化。" — [Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/)，No Priors 播客，2026 年 3 月

当我听到 Karpathy 这么说时，我想知道怎么做到的。一个人怎么可能像一个 20 人的团队一样发布代码？Peter Steinberger 构建了 [OpenClaw](https://github.com/openclaw/openclaw) — 247K GitHub stars — 基本上是一个人用 AI 智能体独立完成的。革命来了。一个掌握正确工具的人可以比传统团队移动得更快。

我是 [Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 总裁兼首席执行官。我与数千家初创公司合作过 — Coinbase、Instacart、Rippling — 当时他们都是在车库里的一两个人。在加入 YC 之前，我是 Palantir 最早的工程师/产品经理/设计师之一，共同创立了 Posterous（被 Twitter 收购），并构建了 Bookface，YC 的内部社交网络。

**gstack 是我的答案。** 我已经构建产品 20 年了，现在我发布的代码比以往任何时候都多。在过去 60 天内：**600,000+ 行生产代码**（35% 的测试），**每天 10,000-20,000 行**，兼职，同时全职运营 YC。这是我在 3 个项目上最后一次 `/retro` 的结果：**添加了 140,751 行，362 次提交，一周内约 115k 净 LOC**。

**2026 — 1,237 次贡献及以上：**

![GitHub 贡献 2026 — 1,237 次贡献，1 月-3 月大幅加速](docs/images/github-2026.png)

**2013 — 当我在 YC 构建 Bookface 时（772 次贡献）：**

![GitHub 贡献 2013 — 772 次贡献，在 YC 构建 Bookface](docs/images/github-2013.png)

同一个人。不同的时代。区别在于工具。

**gstack 就是我的做法。** 它将 Claude Code 转变为虚拟工程团队 — 一个重新思考产品的 CEO、一个锁定架构的工程经理、一个捕获 AI 垃圾的设计师、一个发现生产错误的审查官、一个打开真实浏览器的 QA 主管、一个运行 OWASP + STRIDE 审计的安全官员，以及一个发布 PR 的发布工程师。二十三名专家和八个强大的工具，全部是斜杠命令，全部是 Markdown，全部免费，MIT 许可证。

这是我的开源软件工厂。我每天都使用它。我分享它是因为这些工具应该对所有人都可用。

复制它。改进它。把它变成你自己的。如果你想对免费开源软件进行诋毁 — 你很乐意，但我希望你先尝试一下。

**这是为谁准备的：**
- **创始人和首席执行官** — 特别是仍然想发布代码的技术创始人
- **第一次使用 Claude Code 的用户** — 结构化角色而不是空白提示符
- **技术主管和员工工程师** — 严格的审查、QA 和每个 PR 的发布自动化

## 快速开始

1. 安装 gstack（30 秒 — 见下文）
2. 运行 `/office-hours` — 描述你正在构建什么
3. 对任何功能想法运行 `/plan-ceo-review`
4. 对任何有更改的分支运行 `/review`
5. 对你的 staging URL 运行 `/qa`
6. 到此为止。你会知道这是否适合你。

## 安装 — 30 秒

**要求：** [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.0+、[Node.js](https://nodejs.org/)（仅 Windows）

### 第 1 步：在你的机器上安装

打开 Claude Code 并粘贴此内容。Claude 会处理其余部分。

> 安装 gstack：运行 **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** 然后向 CLAUDE.md 添加一个"gstack"部分，该部分说明对所有网络浏览使用来自 gstack 的 /browse 技能，永远不要使用 mcp__claude-in-chrome__* 工具，并列出可用的技能：/office-hours、/plan-ceo-review、/plan-eng-review、/plan-design-review、/design-consultation、/design-shotgun、/design-html、/review、/ship、/land-and-deploy、/canary、/benchmark、/browse、/connect-chrome、/qa、/qa-only、/design-review、/setup-browser-cookies、/setup-deploy、/retro、/investigate、/document-release、/codex、/cso、/autoplan、/plan-devex-review、/devex-review、/careful、/freeze、/guard、/unfreeze、/gstack-upgrade、/learn。然后问用户是否也想将 gstack 添加到当前项目，以便队友可以获得它。

### 第 2 步：团队模式 — 共享仓库的自动更新（推荐）

每个开发者全局安装，更新会自动发生：

```bash
cd ~/.claude/skills/gstack && ./setup --team
```

然后初始化你的仓库，以便队友可以获得它：

```bash
cd <your-repo>
~/.claude/skills/gstack/bin/gstack-team-init required  # 或：optional
git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

你的仓库中没有供应商文件，没有版本漂移，没有手动升级。每个 Claude Code 会话都以快速的自动更新检查开始（限制为每小时一次，网络故障安全，完全无声）。

> **贡献或需要完整历史？** 上述命令使用 `--depth 1` 以快速安装。如果您计划贡献或需要完整的 git 历史，请执行完整克隆：
> ```bash
> git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> ```

### OpenClaw

OpenClaw 通过 ACP 生成 Claude Code 会话，所以每个 gstack 技能在 Claude Code 安装了 gstack 时都可以工作。将此粘贴到你的 OpenClaw 智能体：

> 安装 gstack：运行 `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup` 为 Claude Code 安装 gstack。然后向 AGENTS.md 添加一个"编码任务"部分，说明当为编码工作生成 Claude Code 会话时，告诉会话使用 gstack 技能。包括这些示例 — 安全审计："加载 gstack。运行 /cso"，代码审查："加载 gstack。运行 /review"，QA 测试 URL："加载 gstack。运行 /qa https://..."，构建端到端功能："加载 gstack。运行 /autoplan，实现计划，然后运行 /ship"，构建前规划："加载 gstack。运行 /office-hours 然后 /autoplan。保存计划，不要实现。"

**设置后，只需自然地与你的 OpenClaw 智能体交谈：**

| 你说 | 会发生什么 |
|---------|-------------|
| "修复 README 中的打字错误" | 简单 — Claude Code 会话，不需要 gstack |
| "对该仓库进行安全审计" | 使用 `运行 /cso` 生成 Claude Code |
| "为我构建通知功能" | 使用 /autoplan → 实现 → /ship 生成 Claude Code |
| "帮助我规划 v2 API 重新设计" | 使用 /office-hours → /autoplan 生成 Claude Code，保存计划 |

详见 [docs/OPENCLAW.md](docs/OPENCLAW.md) 获取高级调度路由和 gstack-lite/gstack-full 提示模板。

### 原生 OpenClaw 技能（通过 ClawHub）

四个方法论技能可以直接在你的 OpenClaw 智能体中工作，不需要 Claude Code 会话。从 ClawHub 安装：

```
clawhub install gstack-openclaw-office-hours gstack-openclaw-ceo-review gstack-openclaw-investigate gstack-openclaw-retro
```

| 技能 | 功能 |
|-------|-------------|
| `gstack-openclaw-office-hours` | 产品审问，包含 6 个强制问题 |
| `gstack-openclaw-ceo-review` | 战略挑战，包含 4 个范围模式 |
| `gstack-openclaw-investigate` | 根本原因调试方法论 |
| `gstack-openclaw-retro` | 每周工程回顾 |

这些是会话技能。你的 OpenClaw 智能体通过聊天直接运行它们。

### 其他 AI 智能体

gstack 可以在 8 个 AI 编程智能体上工作，不仅仅是 Claude。安装程序会自动检测你已安装的智能体：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup
```

或使用 `./setup --host <name>` 针对特定智能体：

| 智能体 | 标志 | 技能安装到 |
|-------|------|-------------------|
| OpenAI Codex CLI | `--host codex` | `~/.codex/skills/gstack-*/` |
| OpenCode | `--host opencode` | `~/.config/opencode/skills/gstack-*/` |
| Cursor | `--host cursor` | `~/.cursor/skills/gstack-*/` |
| Factory Droid | `--host factory` | `~/.factory/skills/gstack-*/` |
| Slate | `--host slate` | `~/.slate/skills/gstack-*/` |
| Kiro | `--host kiro` | `~/.kiro/skills/gstack-*/` |

**想添加对另一个智能体的支持？** 详见 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。
它是一个 TypeScript 配置文件，零代码更改。

## 看它工作

```
你：    我想为我的日历构建一个日常简报应用。
你：    /office-hours
Claude: [询问痛点 — 具体例子，不是假想]

你：    多个 Google 日历，事件信息过时、位置错误。
        准备工作花费很长时间，结果不够好...

Claude: 我要对你的框架提出反对。你说"日常简报应用"。
        但你实际上描述的是一个个人首席幕僚 AI。
        [提取 5 个你没意识到自己在描述的能力]
        [质疑 4 个前提 — 你同意、不同意或调整]
        [生成 3 个实现方案，包含努力估计]
        建议：明天发布最小范围楔形，从真实使用中学习。
        完整愿景是一个 3 个月的项目 — 从有效的日常简报开始。
        [编写设计文档 → 自动传入下游技能]

你：    /plan-ceo-review
        [读设计文档，质疑范围，运行 10 部分审查]

你：    /plan-eng-review
        [ASCII 图表显示数据流、状态机、错误路径]
        [测试矩阵、失败模式、安全问题]

你：    批准计划。退出计划模式。
        [跨 11 个文件编写 2,400 行。~8 分钟。]

你：    /review
        [自动修复] 2 个问题。[询问] 竞态条件 → 你批准修复。

你：    /qa https://staging.myapp.com
        [打开真实浏览器，点击所有流程，发现并修复错误]

你：    /ship
        测试：42 → 51 (+9 个新的)。PR：github.com/you/app/pull/42
```

你说"日常简报应用"。智能体说"你正在构建一个幕僚 AI" — 因为它听到你的痛点，而不是你的功能请求。八个命令，从头到尾。这不是副驾驶。这是一个团队。

## 冲刺

gstack 是一个过程，而不是工具的集合。技能按冲刺运行的顺序运行：

**思考 → 规划 → 构建 → 审查 → 测试 → 发布 → 反思**

每个技能都输入到下一个。`/office-hours` 编写一个设计文档，`/plan-ceo-review` 读取。`/plan-eng-review` 编写一个测试计划，`/qa` 选择。`/review` 捕获错误，`/ship` 验证已修复。没有任何东西掉落，因为每一步都知道之前发生了什么。

| 技能 | 你的专家 | 他们做什么 |
|-------|----------------|--------------|
| `/office-hours` | **YC 办公时间** | 从这里开始。六个强制问题，在你编写代码之前重新框架化你的产品。对你的框架提出反对，质疑前提，生成实现替代方案。设计文档传入每个下游技能。 |
| `/plan-ceo-review` | **CEO / 创始人** | 重新思考问题。找到隐藏在请求中的 10 星级产品。四个模式：扩展、选择性扩展、保留范围、缩减。 |
| `/plan-eng-review` | **工程经理** | 锁定架构、数据流、图表、边界情况和测试。将隐藏的假设强制显露。 |
| `/plan-design-review` | **高级设计师** | 将每个设计维度评分 0-10，解释 10 分是什么样子，然后编辑计划以实现。AI 垃圾检测。交互式 — 每个设计选择一个 AskUserQuestion。 |
| `/plan-devex-review` | **开发者体验主管** | 交互式 DX 审查：探索开发者角色，对标竞争对手的 TTHW，设计你的神奇时刻，逐步跟踪摩擦点。三个模式：DX 扩展、DX 完善、DX 分类。20-45 个强制问题。 |
| `/design-consultation` | **设计合作伙伴** | 从头开始构建完整的设计系统。研究景观，提出创意风险，生成逼真的产品模型。 |
| `/review` | **员工工程师** | 找到通过 CI 但在生产中炸裂的错误。自动修复明显的错误。标记完整性差距。 |
| `/investigate` | **调试者** | 系统根本原因调试。铁律：不调查就没修复。跟踪数据流、测试假设、在 3 次失败后停止。 |
| `/design-review` | **编码的设计师** | 与 /plan-design-review 相同的审计，然后修复发现的内容。原子提交、前后截图。 |
| `/devex-review` | **DX 测试员** | 实时开发者体验审计。实际测试你的入门：导航文档、尝试入门流程、计时 TTHW、截图错误。对比 `/plan-devex-review` 得分 — 回旋镖显示你的计划是否与现实相符。 |
| `/design-shotgun` | **设计探索者** | "给我看选项。"生成 4-6 个 AI 模型变体，在你的浏览器中打开比较委员会，收集你的反馈，并迭代。品味记忆学到你喜欢什么。重复直到你喜欢某个东西，然后交给 `/design-html`。 |
| `/design-html` | **设计工程师** | 将模型转变为实际有效的生产 HTML。Pretext 计算布局：文本在调整大小时重排，高度调整到内容，布局是动态的。30KB，零依赖。检测 React/Svelte/Vue。每个设计类型的智能 API 路由（登陆页面与仪表板与表单）。输出是你实际会发布的东西，不是演示。 |
| `/qa` | **QA 主管** | 测试你的应用，找到错误，用原子提交修复它们，重新验证。为每个修复自动生成回归测试。 |
| `/qa-only` | **QA 报告者** | 与 /qa 相同的方法论但仅报告。纯错误报告，不进行代码更改。 |
| `/pair-agent` | **多智能体协调员** | 与任何 AI 智能体共享你的浏览器。一个命令，一个粘贴，已连接。适用于 OpenClaw、Hermes、Codex、Cursor 或任何可以 curl 的东西。每个智能体获得自己的标签页。自动启动有头模式，以便你可以看到所有内容。为远程智能体自动启动 ngrok 隧道。范围令牌、标签页隔离、速率限制、活动归属。 |
| `/cso` | **首席安全官** | OWASP 十大 + STRIDE 威胁模型。零噪音：17 个假阳性排除、8/10+ 置信门、独立发现验证。每个发现包括具体的利用场景。 |
| `/ship` | **发布工程师** | 同步 main、运行测试、审计覆盖率、推送、打开 PR。如果你没有测试框架，从头引导。 |
| `/land-and-deploy` | **发布工程师** | 合并 PR、等待 CI 和部署、验证生产健康。从"已批准"到"在生产中验证"一个命令。 |
| `/canary` | **SRE** | 部署后监控循环。监视控制台错误、性能回归和页面故障。 |
| `/benchmark` | **性能工程师** | 基准页面加载时间、Core Web Vitals 和资源大小。在每个 PR 上比较前后。 |
| `/document-release` | **技术文档编写者** | 更新所有项目文档以匹配你刚发布的内容。自动捕获过期的 README。 |
| `/retro` | **工程经理** | 团队感知的每周回顾。每个人的分解、发布连胜、测试健康趋势、增长机会。`/retro global` 在你所有项目和 AI 工具（Claude Code、Codex、Gemini）中运行。 |
| `/browse` | **QA 工程师** | 给智能体眼睛。真实 Chromium 浏览器、真实点击、真实截图。~100ms 每个命令。`/open-gstack-browser` 启动带有侧边栏、反机器人隐形和自动模型路由的 GStack 浏览器。 |
| `/setup-browser-cookies` | **会话管理员** | 从你的真实浏览器（Chrome、Arc、Brave、Edge）导入 Cookie 到无头会话。测试经过身份验证的页面。 |
| `/autoplan` | **审查流程** | 一个命令，完全审查的计划。自动运行 CEO → 设计 → 工程审查，包含编码的决策原则。仅将品味决策表面化供你批准。 |
| `/learn` | **记忆** | 管理 gstack 在会话中学到的东西。审查、搜索、修剪和导出特定于项目的模式、陷阱和偏好。学习在会话中复合，所以 gstack 在你的代码库上变得更聪明。 |

### 我应该使用哪个审查？

| 构建对象... | 计划阶段（代码之前） | 实时审计（发布后） |
|-----------------|--------------------------|----------------------------|
| **最终用户**（UI、网络应用、移动） | `/plan-design-review` | `/design-review` |
| **开发者**（API、CLI、SDK、文档） | `/plan-devex-review` | `/devex-review` |
| **架构**（数据流、性能、测试） | `/plan-eng-review` | `/review` |
| **所有以上** | `/autoplan`（运行 CEO → 设计 → 工程 → DX，自动检测适用的） | — |

### 强大的工具

| 技能 | 功能 |
|-------|-------------|
| `/codex` | **第二意见** — 来自 OpenAI Codex CLI 的独立代码审查。三种模式：审查（通过/失败门）、对抗挑战和开放咨询。当 `/review` 和 `/codex` 都审查过同一分支时，进行跨模型分析。 |
| `/careful` | **安全防护** — 在破坏性命令之前警告（rm -rf、DROP TABLE、force-push）。说"要小心"来激活。覆盖任何警告。 |
| `/freeze` | **编辑锁定** — 将文件编辑限制到一个目录。在调试时防止意外变化。 |
| `/guard` | **完全安全** — `/careful` + `/freeze` 一个命令。生产工作的最大安全。 |
| `/unfreeze` | **解锁** — 移除 `/freeze` 边界。 |
| `/open-gstack-browser` | **GStack 浏览器** — 启动带有侧边栏、反机器人隐形、自动模型路由（Sonnet 用于操作，Opus 用于分析）、一键 Cookie 导入和 Claude Code 集成的 GStack 浏览器。清理页面、拍聪明的截图、编辑 CSS，将信息传回你的终端。 |
| `/setup-deploy` | **部署配置员** — `/land-and-deploy` 的一次设置。检测你的平台、生产 URL 和部署命令。 |
| `/gstack-upgrade` | **自我更新器** — 将 gstack 升级到最新版本。检测全局 vs 供应商安装、同步两者、显示更改内容。 |

**[对每个技能的深入了解、示例和哲学 →](docs/skills.md)**

## 平行冲刺

gstack 与一个冲刺配合得很好。十个同时运行时变得很有趣。

[Conductor](https://conductor.build) 并行运行多个 Claude Code 会话 — 每个在自己的隔离工作区中。一个会话在新想法上运行 `/office-hours`，另一个在 PR 上做 `/review`，第三个实现一个功能，第四个在 staging 上运行 `/qa`，还有六个在其他分支上。全部同时。我定期运行 10-15 个平行冲刺 — 目前的实际最大值。

冲刺结构使平行性工作。没有过程，十个智能体是十个混乱的来源。有过程 — 思考、规划、构建、审查、测试、发布 — 每个智能体知道完全要做什么和何时停止。你像 CEO 管理团队一样管理它们：检查重要的决策，让其余的运行。

### 语音输入（AquaVoice、Whisper 等）

gstack 技能具有语音友好的触发短语。自然地说出你想要的 —"运行安全检查"、"测试网站"、"做工程审查" — 正确的技能激活。你无需记住斜杠命令名称或首字母缩略词。

## 卸载

### 选项 1：运行卸载脚本

如果 gstack 安装在你的机器上：

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
```

这处理技能、符号链接、全局状态（`~/.gstack/`）、项目本地状态、浏览守护程序和临时文件。使用 `--keep-state` 保留配置和分析。使用 `--force` 跳过确认。

### 选项 2：手动移除（无本地仓库）

如果你没有克隆仓库（例如，你通过 Claude Code 粘贴安装，稍后删除了克隆）：

```bash
# 1. 停止浏览守护程序
pkill -f "gstack.*browse" 2>/dev/null || true

# 2. 移除指向 gstack/ 的每个技能符号链接
find ~/.claude/skills -maxdepth 1 -type l 2>/dev/null | while read -r link; do
  case "$(readlink "$link" 2>/dev/null)" in gstack/*|*/gstack/*) rm -f "$link" ;; esac
done

# 3. 移除 gstack
rm -rf ~/.claude/skills/gstack

# 4. 移除全局状态
rm -rf ~/.gstack

# 5. 移除集成（跳过你从未安装的任何）
rm -rf ~/.codex/skills/gstack* 2>/dev/null
rm -rf ~/.factory/skills/gstack* 2>/dev/null
rm -rf ~/.kiro/skills/gstack* 2>/dev/null
rm -rf ~/.openclaw/skills/gstack* 2>/dev/null

# 6. 移除临时文件
rm -f /tmp/gstack-* 2>/dev/null

# 7. 每个项目清理（从每个项目根目录运行）
rm -rf .gstack .gstack-worktrees .claude/skills/gstack 2>/dev/null
rm -rf .agents/skills/gstack* .factory/skills/gstack* 2>/dev/null
```

### 清理 CLAUDE.md

卸载脚本不编辑 CLAUDE.md。在添加了 gstack 的每个项目中，移除 `## gstack` 和 `## 技能路由` 部分。

### Playwright

`~/Library/Caches/ms-playwright/`（macOS）保持不动，因为其他工具可能共享它。如果没有其他东西需要它，请移除它。

---

免费、MIT 许可、开源。没有高级层级、没有等候列表。

我开源了我构建软件的方式。你可以复制它并使用它。

> **我们正在招聘。** 想每天发布 10K+ LOC 并帮助加强 gstack？
> 来 YC 工作 — [ycombinator.com/software](https://ycombinator.com/software)
> 极具竞争力的薪酬和股权。旧金山，Dogpatch 区。

## 文档

| 文档 | 涵盖内容 |
|-----|---------------|
| [技能深入了解](docs/skills.md) | 每个技能的哲学、示例和工作流（包括 Greptile 集成） |
| [构建者精神](ETHOS.md) | 构建者哲学：沸腾这个湖、先搜索后构建、知识的三层 |
| [架构](ARCHITECTURE.md) | 设计决策和系统内部结构 |
| [浏览器参考](BROWSER.md) | `/browse` 的完整命令参考 |
| [贡献](CONTRIBUTING.md) | 开发设置、测试、贡献者模式和开发模式 |
| [更新日志](CHANGELOG.md) | 每个版本的新增内容 |

## 隐私和遥测

gstack 包括**选择加入**的使用遥测，以帮助改进项目。以下是确切发生的情况：

- **默认为关闭。** 除非你明确说是，否则没有任何东西被发送到任何地方。
- **在第一次运行时，** gstack 询问你是否想共享匿名使用数据。你可以说不。
- **如果你选择加入，会发送什么：** 技能名称、持续时间、成功/失败、gstack 版本、操作系统。仅此而已。
- **永远不会发送什么：** 代码、文件路径、仓库名称、分支名称、提示或任何用户生成的内容。
- **随时更改：** `gstack-config set telemetry off` 立即禁用一切。

数据存储在 [Supabase](https://supabase.com)（开源 Firebase 替代品）中。架构位于 [`supabase/migrations/`](supabase/migrations/) — 你可以验证收集的确切内容。仓库中的 Supabase 可发布密钥是公钥（如 Firebase API 密钥）— 行级安全策略拒绝所有直接访问。遥测通过验证边缘函数流动，强制执行架构检查、事件类型允许列表和字段长度限制。

**本地分析始终可用。** 运行 `gstack-analytics` 从本地 JSONL 文件查看你的个人使用仪表板 — 不需要远程数据。

## 故障排查

**技能没有显示？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**陈旧的安装？** 运行 `/gstack-upgrade` — 或在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true`

**想要更短的命令？** `cd ~/.claude/skills/gstack && ./setup --no-prefix` — 从 `/gstack-qa` 切换到 `/qa`。你的选择被记住以供未来升级。

**想要命名空间命令？** `cd ~/.claude/skills/gstack && ./setup --prefix` — 从 `/qa` 切换到 `/gstack-qa`。如果你在 gstack 旁边运行其他技能包很有用。

**Codex 说"跳过加载技能，因为 SKILL.md 无效"？** 你的 Codex 技能描述已过时。修复：`cd ~/.codex/skills/gstack && git pull && ./setup --host codex` — 或对于仓库本地安装：`cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows 用户：** gstack 可以在 Windows 11 上通过 Git Bash 或 WSL 工作。除了 Bun 还需要 Node.js — Bun 在 Windows 上的 Playwright 管道传输有一个已知错误（[bun#4253](https://github.com/oven-sh/bun/issues/4253)）。浏览服务器自动回退到 Node.js。确保 `bun` 和 `node` 都在你的 PATH 中。

**Claude 说它看不到技能？** 确保你项目的 `CLAUDE.md` 有一个 gstack 部分。添加这个：

```
## gstack
对所有网络浏览使用来自 gstack 的 /browse。永远不要使用 mcp__claude-in-chrome__* 工具。
可用技能：/office-hours、/plan-ceo-review、/plan-eng-review、/plan-design-review、
/design-consultation、/design-shotgun、/design-html、/review、/ship、/land-and-deploy、
/canary、/benchmark、/browse、/open-gstack-browser、/qa、/qa-only、/design-review、
/setup-browser-cookies、/setup-deploy、/retro、/investigate、/document-release、/codex、
/cso、/autoplan、/pair-agent、/careful、/freeze、/guard、/unfreeze、/gstack-upgrade、/learn。
```

## 许可证

MIT。永远免费。去构建一些东西吧。
