# gstack × OpenClaw 集成

gstack 与 OpenClaw 集成为方法论来源，而非移植的代码库。
OpenClaw 的 ACP 运行时本地生成 Claude Code 会话。gstack 提供
使这些会话更好的规划纪律和方法论。

这是一个轻量级协议，编码为提示文本。没有守护进程。没有 JSON-RPC。
没有兼容性矩阵。提示是桥梁。

## 架构

```
  OpenClaw                               gstack 仓库
  ─────────────────────                    ──────────────
  编排器：消息传递，                         规划方法论和
  日历，内存，EA                          规划的真实来源
       │                                        │
       ├── 本地技能（对话式）                   ├── 通过生成生成本地技能
       │   office-hours、ceo-review、     │   gen-skill-docs 管道
       │   investigate、retro                │
       │                                        ├── 生成 gstack-lite
       ├── sessions_spawn(runtime: "acp")      │   （规划纪律）
       │       │                                │
       │       └── Claude Code                  ├── 生成 gstack-full
       │           └── gstack 安装在           │   （完整管道）
       │               ~/.claude/skills/gstack  │
       │                                        └── docs/OPENCLAW.md（本文件）
       └── 调度路由（AGENTS.md）
```

## 调度路由

OpenClaw 在生成时间决定要使用哪个 gstack 支持层：

| 层级 | 何时 | 提示前缀 |
|------|------|---------|
| **简单** | 单文件编辑、打字错误、配置更改 | 未注入 gstack 上下文 |
| **中等** | 多文件功能、重构 | 添加 gstack-lite CLAUDE.md |
| **重量级** | 需要特定 gstack 技能 | "加载 gstack。运行 /X" |
| **完整** | 完整功能、目标、项目 | 追加 gstack-full 管道 |
| **计划** | "帮我计划一个 Claude Code 项目" | 追加 gstack-plan 管道 |

### 决策启发式

- 可以用 <10 行代码完成吗？-> **简单**
- 是否接触多个文件，但方法很明显？-> **中等**
- 用户是否提名特定技能（/cso、/review、/qa）？-> **重量级**
- 是功能、项目或目标（不是任务）吗？-> **完整**
- 用户是否想在不实现的情况下计划 Claude Code？-> **计划**

### 调度路由指南（针对 AGENTS.md）

完整的准备好的粘贴部分位于 `openclaw/agents-gstack-section.md`。
将其复制到您的 OpenClaw AGENTS.md。

关键行为规则（这些位于调度层上方）：

1. **始终生成，从不重定向。** 当用户要求使用任何 gstack 技能时，
   始终生成 Claude Code 会话。绝不告诉用户打开 Claude Code。
2. **解决仓库。** 如果用户命名仓库，设置工作目录。如果
   未知，询问哪个仓库。
3. **自动计划从头到尾运行。** 生成，让其运行完整管道，在聊天中报告。用户永远不应该离开 Telegram。

### CLAUDE.md 碰撞处理

当生成的 Claude Code 在已经有 CLAUDE.md 的仓库中时，追加
gstack-lite/full 作为新部分。不要替换仓库的现有说明。

## gstack 为 OpenClaw 生成什么

所有工件位于 `openclaw/` 目录中，并由
`bun run gen:skill-docs --host openclaw` 生成：

### gstack-lite（中等层）
`openclaw/gstack-lite-CLAUDE.md` — ~15 行的规划纪律：
1. 在修改前读取每个文件
2. 写一个 5 行计划：什么、为什么、哪些文件、测试用例、风险
3. 使用决策原则解决歧义
4. 报告前自我审查
5. 完成报告：运送什么、做出的决定、任何不确定的事项

A/B 测试：2 倍时间，显著更好的输出。

### gstack-full（完整层）
`openclaw/gstack-full-CLAUDE.md` — 链接现有 gstack 技能：
1. 读取 CLAUDE.md 并理解项目
2. 运行 /autoplan（CEO + eng + 设计审查）
3. 实现批准的计划
4. 运行 /ship 创建 PR
5. 报告 PR URL 和决定

### gstack-plan（计划层）
`openclaw/gstack-plan-CLAUDE.md` — 完整审查高架，无实现：
1. 运行 /office-hours 生成设计文档
2. 运行 /autoplan（CEO + eng + 设计 + DX 审查 + codex 对抗性）
3. 将审查的计划保存到 `plans/<project-slug>-plan-<date>.md`
4. 报告：计划路径、摘要、关键决定、建议的下一步

编排器将计划链接持久化到其自己的内存存储（大脑仓库、
知识库或 AGENTS.md 中配置的任何内容）。当用户
准备构建时，生成一个引用已保存计划的完整会话。

### 本地方法论技能
已发布到 ClawHub。使用 `clawhub install` 安装：
- `gstack-openclaw-office-hours` — 产品审问（6 个强制问题）
- `gstack-openclaw-ceo-review` — 战略挑战（10 部分审查，4 种模式）
- `gstack-openclaw-investigate` — 操作调试（4 阶段方法论）
- `gstack-openclaw-retro` — 操作回顾（每周审查）

源代码位于 gstack 仓库中的 `openclaw/skills/`。这些是
gstack 方法论对 OpenClaw 对话语境的手工调整。
没有 gstack 基础设施（没有浏览、没有遥测、没有前导）。

## 生成的会话检测

当 Claude Code 在由 OpenClaw 生成的会话内运行时，应该设置 `OPENCLAW_SESSION`
环境变量。gstack 检测到这一点并调整：
- 跳过交互式提示（自动选择建议的选项）
- 跳过升级检查和遥测提示
- 集中在任务完成和散文报告上

在 sessions_spawn 中设置环境变量：`env: { OPENCLAW_SESSION: "1" }`

## 安装

对于 OpenClaw 用户：告诉您的 OpenClaw 智能体"为 openclaw 安装 gstack"。

智能体应该：
1. 将 gstack-lite CLAUDE.md 安装到其编码会话模板中
2. 安装 4 个本地方法论技能
3. 将调度路由添加到 AGENTS.md
4. 通过测试生成验证

对于 gstack 开发人员：`./setup --host openclaw` 输出此文档。
实际工件由 `bun run gen:skill-docs --host openclaw` 生成。

## 我们不做的事

- 没有调度守护进程（ACP 处理会话生成）
- 没有 Clawvisor 中继（不需要安全层）
- 没有双向学习桥接（大脑仓库是知识存储）
- 没有 JSON 架构或协议版本控制
- 没有来自 gstack 的 SOUL.md（OpenClaw 有自己的）
- 没有完整的技能移植（编码技能保持 Claude Code 的本地）
