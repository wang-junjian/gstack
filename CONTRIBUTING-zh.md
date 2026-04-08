# 对 gstack 的贡献

感谢想让 gstack 更好。无论你修复技能提示中的拼写错误或构建一个全新的工作流，本指南会快速让你运行。

## 快速开始

gstack 技能是 Markdown 文件，Claude Code 从 `skills/` 目录发现。通常它们在 `~/.claude/skills/gstack/` 中（你的全局安装）。但当你开发 gstack 本身时，你想要 Claude Code 使用你工作树中的技能——所以编辑立即生效而无需复制或部署任何东西。

那就是开发模式做什么。它将你的 repo symlinks 到本地 `.claude/skills/` 目录所以 Claude Code 直接从你的检查中读技能。

```bash
git clone <repo> && cd gstack
bun install                    # 安装依赖
bin/dev-setup                  # 激活开发模式
```

现在编辑任何 `SKILL.md`、在 Claude Code 中调用它（例如 `/review`）并实时看你的改变。当你完成开发：

```bash
bin/dev-teardown               # 停用——回到你的全局安装
```

## 操作自我改进

gstack 自动从失败学习。在每个技能会话的结束，智能体
反思什么出了问题（CLI 错误、错误方法、项目怪癖）并记录
操作学习到 `~/.gstack/projects/{slug}/learnings.jsonl`。未来会话
自动表面这些学习，所以 gstack 在你的代码库上变得更聪明随时间。

无设置需要。学习自动日志记录。用 `/learn` 查看它们。

### 贡献者工作流

1. **正常使用 gstack** ——操作学习自动捕获
2. **检查你的学习：** `/learn` 或 `ls ~/.gstack/projects/*/learnings.jsonl`
3. **Fork 并 clone gstack**（如果你还没）
4. **Symlink 你的 fork 到你击中 bug 的项目：**
   ```bash
   # 在你的核心项目中（gstack 烦恼你的地方）
   ln -sfn /path/to/your/gstack-fork .claude/skills/gstack
   cd .claude/skills/gstack && bun install && bun run build && ./setup
   ```
   设置创建按技能目录带 SKILL.md symlinks 里面（`qa/SKILL.md -> gstack/qa/SKILL.md`）
   并问你的前缀偏好。通过 `--no-prefix` 跳过提示和使用简短名。
5. **修复问题** ——你的改变立即在这个项目中是实时的
6. **通过实际使用 gstack 测试** ——做烦恼你的东西，验证它修复了
7. **从你的 fork 打开 PR**

这是最好的贡献方式：在做你真实工作的项目中修复 gstack，在你实际感到痛的地方。

### 会话感知

当你有 3+ gstack 会话打开同时，每个问题告诉你哪个项目、哪个分支、什么发生中。不再盯着问题想"等等，这是哪个窗口？"格式一致横跨所有技能。

## 在 gstack repo 内部工作 gstack

当你编辑 gstack 技能并想通过实际使用 gstack 测试它们
在相同的 repo，`bin/dev-setup` 连接这个。它创建 `.claude/skills/`
symlinks（gitignored）指向后面到你的工作树，所以 Claude Code 使用
你的本地编辑代替全局安装。

```
gstack/                          <- 你的工作树
├── .claude/skills/              <- 由 dev-setup 创建（gitignored）
│   ├── gstack -> ../../         <- symlink 回 repo 根
│   ├── review/                  <- 真实目录（简短名、默认）
│   │   └── SKILL.md -> gstack/review/SKILL.md
│   ├── ship/                    <- 或 gstack-review/、gstack-ship/ 如果 --prefix
│   │   └── SKILL.md -> gstack/ship/SKILL.md
│   └── ...                      <- 一个目录每个技能
├── review/
│   └── SKILL.md                 <- 编辑这个、用 /review 测试
├── ship/
│   └── SKILL.md
├── browse/
│   ├── src/                     <- TypeScript 源
│   └── dist/                    <- 编译的二进制（gitignored）
└── ...
```

设置创建真实目录（不 symlinks）在顶层带 SKILL.md
symlink 里面。这确保 Claude 发现它们作为顶层技能，不嵌套
在 `gstack/` 下。名字取决于你的前缀设置（`~/.gstack/config.yaml`）。
简短名（`/review`、`/ship`）是默认。运行 `./setup --prefix` 如果你
推荐命名空间名（`/gstack-review`、`/gstack-ship`）。

## 日常工作流

```bash
# 1. 进入开发模式
bin/dev-setup

# 2. 编辑一个技能
vim review/SKILL.md

# 3. 在 Claude Code 中测试它——改变是实时的
#    > /review

# 4. 编辑浏览器源？重建二进制文件
bun run build

# 5. 今天完成了？撕掉
bin/dev-teardown
```

## 测试 & 评估

### 设置

```bash
# 1. 复制 .env.example 并添加你的 API 密钥
cp .env.example .env
# 编辑 .env → 设置 ANTHROPIC_API_KEY=sk-ant-...

# 2. 安装依赖（如果你还没）
bun install
```

Bun 自动加载 `.env` ——无额外配置。Conductor 工作区从主工作树自动继承 `.env`（看"Conductor 工作区"下方）。

### 测试层

| 层 | 命令 | 成本 | 它测试什么 |
|----|------|------|-----------|
| 1 ——静态 | `bun test` | 免费 | 命令验证、快照标志、SKILL.md 正确性、TODOS format.md refs、可观测性单元测试 |
| 2 ——E2E | `bun run test:e2e` | ~$3.85 | 完整技能执行通过 `claude -p` 子进程 |
| 3 ——LLM 评估 | `bun run test:evals` | ~$0.15 独立 | LLM 作为判官评评分生成 SKILL.md 文档 |
| 2+3 | `bun run test:evals` | ~$4 合并 | E2E + LLM 作为判官（运行两个） |

```bash
bun test                     # 第 1 层仅（在每个提交上运行，<5s）
bun run test:e2e             # 第 2 层：仅 E2E（需要 EVALS=1、不能在 Claude Code 内运行）
bun run test:evals           # 第 2 + 3 合并（~$4/run）
```

### 第 1 层：静态验证（免费）

用 `bun test` 自动运行。无 API 密钥需要。

- **技能解析器测试**（`test/skill-parser.test.ts`）——从 SKILL.md bash 代码块提取每个 `$B` 命令并根据 `browse/src/commands.ts` 中的命令注册表验证。捕捉拼写错误、移除的命令和无效快照标志。
- **技能验证测试**（`test/skill-validation.test.ts`）——验证 SKILL.md 文件仅参考真实命令和标志，以及命令描述符合质量阈值。
- **生成器测试**（`test/gen-skill-docs.test.ts`）——测试模板系统：验证占位符正确解析、输出包括值提示用于标志（例如 `-d <N>` 不仅 `-d`）、命令的富有描述（例如 `is` 列出有效状态、`press` 列举关键示例）。

### 第 2 层：E2E 通过 `claude -p`（~$3.85/run）

生成 `claude -p` 作为子进程带 `--output-format stream-json --verbose`、流 NDJSON 用于实时进度、扫描浏览错误。这是最接近"这个技能实际上端到端工作吗？"

```bash
# 必须从纯终端运行——不能在 Claude Code 或 Conductor 内嵌套
EVALS=1 bun test test/skill-e2e-*.test.ts
```

- 在 `EVALS=1` env 变量后面有门控（防止意外昂贵的运行）
- 自动跳过如果在 Claude Code 内运行（`claude -p` 不能嵌套）
- API 连接性预检——在燃烧预算前快速失败在 ConnectionRefused
- 实时进度到 stderr：`[Ns] turn T tool #C: Name(...)`
- 为调试保存完整 NDJSON 记录和失败 JSON
- 测试在 `test/skill-e2e-*.test.ts`（按类别分割）、运行器逻辑在 `test/helpers/session-runner.ts`

### E2E 可观测性

当 E2E 测试运行时，它们在 `~/.gstack-dev/` 产生机器可读工件：

| 工件 | 路径 | 目的 |
|------|------|------|
| 心跳 | `e2e-live.json` | 当前测试状态（每个工具调用更新） |
| 部分结果 | `evals/_partial-e2e.json` | 已完成测试（幸存于杀死） |
| 进度日志 | `e2e-runs/{runId}/progress.log` | 仅追加文本日志 |
| NDJSON 记录 | `e2e-runs/{runId}/{test}.ndjson` | 原始 `claude -p` 输出每个测试 |
| 失败 JSON | `e2e-runs/{runId}/{test}-failure.json` | 失败诊断数据 |

**实时仪表盘：** 在第二个终端运行 `bun run eval:watch` 查看实时仪表盘显示已完成测试、当前运行测试和成本。使用 `--tail` 也显示最后 10 行 progress.log。

**评估历史工具：**

```bash
bun run eval:list            # 列举所有评估运行（转向、持续时间、每次运行的成本）
bun run eval:compare         # 比较两个运行——显示每个测试增量 + Takeaway 评论
bun run eval:summary         # 聚合统计 + 每个测试效率平均跨运行
```

**评估比较评论：** `eval:compare` 生成自然语言 Takeaway 部分解释什么改变在运行之间——旗标回归、记注改进、调出效率获得（更少转向、更快、更便宜），生成总体概览。这驱动通过 `generateCommentary()` 在 `eval-store.ts`。

工件永远不被清理——它们累积在 `~/.gstack-dev/` 用于事后调试和趋势分析。

### 第 3 层：LLM 作为判官（~$0.15/run）

使用 Claude Sonnet 对生成 SKILL.md 文档评分三个维度：

- **清晰性** ——AI 智能体甚至可以无二义性理解说明吗？
- **完整性** ——所有命令、标志和使用模式都完成文档吗？
- **可行性** ——智能体可以仅使用文档中的信息执行任务吗？

每个维度 1-5 分。阈值：每个维度必须分 **≥ 4**。也有一个回归测试比较生成文档对来自 `origin/main` 的手维护基准——生成必须分等于或更高。

```bash
# 需要 .env - 包含在 bun run test:evals 中的 ANTHROPIC_API_KEY
```

- 使用 `claude-sonnet-4-6` 用于评分稳定性
- 测试在 `test/skill-llm-eval.test.ts`
- 调用 Anthropic API 直接（不是 `claude -p`），所以它在 Claude Code 内任何地方工作包括

### CI

一个 GitHub Action（`.github/workflows/skill-docs.yml`）在每个推和 PR 上运行 `bun run gen:skill-docs --dry-run`。如果生成 SKILL.md 文件不同从什么提交，CI 失败。这捕捉陈旧文档在它们合并前。

测试直接针对浏览器二进制运行——它们不需要开发模式。

## 编辑 SKILL.md 文件

SKILL.md 文件是**从 `.tmpl` 模板生成的**。不编辑 `.md` 直接——你的改变会在下一个构建时被覆盖。

```bash
# 1. 编辑模板
vim SKILL.md.tmpl              # 或 browse/SKILL.md.tmpl

# 2. 为所有主机重新生成
bun run gen:skill-docs --host all

# 3. 检查健康（报告所有主机）
bun run skill:check

# 或使用监测模式——在变更时自动重新生成
bun run dev:skill
```

用于模板著作最佳实践（自然语言胜过 bash-isms、动态分支检测、`{{BASE_BRANCH_DETECT}}` 用法），看 CLAUDE.md 的"编写 SKILL 模板"部分。

要添加浏览器命令，添加它到 `browse/src/commands.ts`。要添加快照标志，添加它到 `snapshot.ts` 中的 `SNAPSHOT_FLAGS`。然后重建。

## 多主机开发

gstack 从一组 `.tmpl` 模板为 8 个主机生成 SKILL.md 文件。
每个主机是一个类型化配置在 `hosts/*.ts`。生成器读这些配置
以生成主机恰当的输出（不同的前言、路径、工具名）。

**支持的主机：** Claude（主要）、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw。

### 为所有主机生成

```bash
# 为一个特定主机生成
bun run gen:skill-docs                    # Claude（默认）
bun run gen:skill-docs --host codex       # Codex
bun run gen:skill-docs --host opencode    # OpenCode
bun run gen:skill-docs --host all         # 所有 8 个主机

# 或使用构建，它做了所有主机 + 编译二进制
bun run build
```

### 什么在主机之间改变

每个主机配置（`hosts/*.ts`）控制：

| 方面 | 例子（Claude vs Codex） |
|------|------------------------|
| 输出目录 | `{skill}/SKILL.md` vs `.agents/skills/gstack-{skill}/SKILL.md` |
| 前言 | 完整（名字、描述、钩子、版本）vs 最小（名字 + 描述） |
| 路径 | `~/.claude/skills/gstack` vs `$GSTACK_ROOT` |
| 工具名 | "使用 Bash 工具" vs 相同（Factory 重写为"运行这个命令"） |
| 钩子技能 | `hooks:` 前言 vs 内联安全建议散文 |
| 压制部分 | 无 vs Codex 自我调用部分移除 |

看 `scripts/host-config.ts` 用于完整的 `HostConfig` 接口。

### 测试主机输出

```bash
# 运行所有静态测试（包括所有主机的参数化烟测试）
bun test

# 检查所有主机的新鲜性
bun run gen:skill-docs --host all --dry-run

# 健康仪表盘涵盖所有主机
bun run skill:check
```

### 添加一个新主机

看 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md) 用于完整指南。简短版本：

1. 创建 `hosts/myhost.ts`（从 `hosts/opencode.ts` 复制）
2. 添加到 `hosts/index.ts`
3. 添加 `.myhost/` 到 `.gitignore`
4. 运行 `bun run gen:skill-docs --host myhost`
5. 运行 `bun test`（参数化测试自动覆盖它）

零生成器、设置或工具代码改变需要。

### 添加一个新技能

当你添加一个新技能模板时，所有主机自动获取它：
1. 创建 `{skill}/SKILL.md.tmpl`
2. 运行 `bun run gen:skill-docs --host all`
3. 动态模板发现选择它，无静态列表更新
4. 提交 `{skill}/SKILL.md`、外部主机输出生成在设置时且 gitignored

## Conductor 工作区

如果你使用 [Conductor](https://conductor.build) 并行运行多个 Claude Code 会话，`conductor.json` 连接工作区生命周期自动：

| 钩子 | 脚本 | 它做什么 |
|------|------|---------|
| `setup` | `bin/dev-setup` | 复制 `.env` 从主工作树、安装依赖、symlink 技能 |
| `archive` | `bin/dev-teardown` | 移除技能 symlinks、清理 `.claude/` 目录 |

当 Conductor 创建一个新工作区，`bin/dev-setup` 自动运行。它检测主工作树（通过 `git worktree list`）、复制你的 `.env` 所以 API 密钥传递、设置开发模式——无手动步骤需要。

**首次设置：** 把你的 `ANTHROPIC_API_KEY` 在主 repo 的 `.env`（看 `.env.example`）。每个 Conductor 工作区自动继承它。

## 要知道的东西

- **SKILL.md 文件是生成的。** 编辑 `.tmpl` 模板，不是 `.md`。运行 `bun run gen:skill-docs` 重新生成。
- **TODOS.md 是统一代工单。** 组织按技能/组件带 P0-P4 优先级。`/ship` 自动检测已完成项目。所有计划/审查/回顾技能读它用于背景。
- **浏览器源改变需要重建。** 如果你触及 `browse/src/*.ts`，运行 `bun run build`。
- **开发模式影背景你的全局安装。** 项目本地技能优先于 `~/.claude/skills/gstack`。`bin/dev-teardown` 恢复全局。
- **Conductor 工作区是独立的。** 每个工作区是它自己的 git worktree。`bin/dev-setup` 通过 `conductor.json` 自动运行。
- **`.env` 跨工作树传播。** 一次设置它在主 repo，所有 Conductor 工作区获得它。
- **`.claude/skills/` 是 gitignored。** Symlinks 永不被提交。

## 在真实项目中测试你的改变

**这是开发 gstack 的推荐方式。** Symlink 你的 gstack 检查到你实际使用它的项目，所以你的改变在你做真实工作时是实时的。

### 步骤 1：Symlink 你的检查

```bash
# 在你的核心项目（不是 gstack repo）
ln -sfn /path/to/your/gstack-checkout .claude/skills/gstack
```

### 步骤 2：运行设置创建每个技能 symlinks

`gstack` symlink 独自不够。Claude Code 通过个别顶层目录发现技能（`qa/SKILL.md`、`ship/SKILL.md` 等），不通过 `gstack/` 目录本身。运行 `./setup` 创建它们：

```bash
cd .claude/skills/gstack && bun install && bun run build && ./setup
```

设置会问你是否想要简短名（`/qa`）或命名空间（`/gstack-qa`）。
你的选择保存到 `~/.gstack/config.yaml` 并被记住用于未来运行。
跳过提示，通过 `--no-prefix`（简短名）或 `--prefix`（命名空间）。

### 步骤 3：开发

编辑一个模板、运行 `bun run gen:skill-docs` 并下一个 `/review` 或 `/qa`
调用立即选择它。无重启需要。

### 回到稳定全局安装

移除项目本地 symlink。Claude Code 回退到 `~/.claude/skills/gstack/`：

```bash
rm .claude/skills/gstack
```

每个技能目录（`qa/`、`ship/` 等）包含指向 `gstack/...` 的 SKILL.md symlinks，所以它们会解析为全局安装自动。

### 切换前缀模式

如果你安装了 gstack 带一个前缀设置并想切换：

```bash
cd .claude/skills/gstack && ./setup --no-prefix   # 切换到 /qa、/ship
cd .claude/skills/gstack && ./setup --prefix       # 切换到 /gstack-qa、/gstack-ship
```

设置自动清理旧 symlinks。无手动清理需要。

### 替代：指向你的全局安装一个分支

如果你不想项目本地 symlinks，你可以切换全局安装：

```bash
cd ~/.claude/skills/gstack
git fetch origin
git checkout origin/<branch>
bun install && bun run build && ./setup
```

这影响所有项目。回滚：`git checkout main && git pull && bun run build && ./setup`。

## 社区 PR 分类（波浪进程）

当社区 PRs 累积时，批处理它们到题材波浪：

1. **分类** ——按题材组（安全、功能、基础设施、文档）
2. **去重** ——如果两个 PRs 修复同样的东西，选择改变更少行的。关闭另外带一个注释指向赢家。
3. **收集器分支** ——创建 `pr-wave-N`、合并清洁 PRs、解析脏的冲突、用 `bun test && bun run build` 验证
4. **用背景关闭** ——每个关闭的 PR 获得一个评论解释
   为什么和什么（如果任何东西）替代它。贡献者做了真实工作；
   用清晰通信尊重它。
5. **作为一个 PR 运送** ——单个 PR 到主带所有属性保存
   在合并提交。包括一个摘要表什么合并了什么关闭了。

看 [PR #205](../../pull/205)（v0.8.3）波浪作为例子。

## 升级迁移

当释放改变在磁盘上状态（目录结构、配置格式、陈旧
文件）以 `./setup` 独自不能修复的方式，添加一个迁移脚本所以现有
用户获得清洁升级。

### 何时添加迁移

- 改变了技能目录创建（symlinks vs 真实目录）
- 重命名或移动了配置密钥在 `~/.gstack/config.yaml`
- 需要删除从前一个版本的孤立文件
- 改变了 `~/.gstack/` 状态文件的格式

不添加迁移用于：新功能（用户自动获取它们）、新技能（设置发现它们）或仅代码改变（无在磁盘状态）。

### 如何添加一个

1. 创建 `gstack-upgrade/migrations/v{VERSION}.sh` 其中 `{VERSION}` 匹配
   需要修复的释放 VERSION 文件。
2. 使其可执行：`chmod +x gstack-upgrade/migrations/v{VERSION}.sh`
3. 脚本必须是**幂等的**（安全运行多次）且
   **非致命的**（失败被日志记录，不阻塞升级）。
4. 包括一个评论块在顶部解释什么改变了、为什么迁移
   需要、哪个用户被影响。

示例：

```bash
#!/usr/bin/env bash
# 迁移：v0.15.2.0 ——修复技能目录结构
# 受影响：有 --no-prefix 安装的用户在 v0.15.2.0 前
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
"$SCRIPT_DIR/bin/gstack-relink" 2>/dev/null || true
```

### 它如何运行

在 `/gstack-upgrade` 期间，在 `./setup` 完成（步骤 4.75）后，升级
技能扫描 `gstack-upgrade/migrations/` 并运行每个 `v*.sh` 脚本
版本更新比用户的旧版本。脚本在版本顺序中运行。
失败被日志记录，但永不阻塞升级。

### 测试迁移

迁移被测试作为 `bun test` 的一部分（第 1 层，免费）。测试套件
验证所有迁移脚本在 `gstack-upgrade/migrations/` 是
可执行且解析无语法错误。

## 运送你的改变

当你对你的技能编辑满意：

```bash
/ship
```

这运行测试、审查差异、分类 Greptile 评论（带 2 层升级）、管理 TODOS.md、凹陷版本、打开 PR。看 `ship/SKILL.md` 用于完整工作流。
