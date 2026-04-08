# gstack — AI 智能体工程工作流

gstack 是一组 SKILL.md 文件集合，为软件开发提供了结构化的智能体角色。每个技能是一个专家：CEO 审查官、工程管理员、设计师、QA 主管、发布工程师、可调试程序等。

## 可用的技能

技能存放在 `.agents/skills/` 目录中。通过名称调用它们（例如 `/office-hours`）。

| 技能 | 功能 |
|-------|-------------|
| `/office-hours` | 从这里开始。在编写代码之前重新框架化您的产品想法。 |
| `/plan-ceo-review` | CEO 级别审查：在请求中找到 10 星级产品。 |
| `/plan-eng-review` | 锁定架构、数据流、边界情况和测试。 |
| `/plan-design-review` | 将每个设计维度评分 0-10, 解释 10 分是什么样子。 |
| `/design-consultation` | 从头开始建立完整的设计系统。 |
| `/review` | 着陆前 PR 审查。找出通过 CI 但在生产中破损的错误。 |
| `/debug` | 系统根本原因调试。不调查就没有修复。 |
| `/design-review` | 设计审计 + 修复循环，带有原子提交。 |
| `/qa` | 打开真实浏览器，找到错误，修复它们，重新验证。 |
| `/qa-only` | 与 /qa 相同但仅报告 — 不进行代码更改。 |
| `/ship` | 运行测试、审查、推送、打开 PR。一个命令。 |
| `/document-release` | 更新所有文档以匹配您刚发布的内容。 |
| `/retro` | 每周回顾，包括每个人的分解和发布连胜。 |
| `/browse` | 无头浏览器 — 真实 Chromium、真实点击、~100ms/命令。 |
| `/setup-browser-cookies` | 从您的真实浏览器导入 Cookie 以进行认证测试。 |
| `/careful` | 在破坏性命令之前警告（rm -rf、DROP TABLE、force-push）。 |
| `/freeze` | 锁定编辑到一个目录。硬块，不仅仅是警告。 |
| `/guard` | 一次激活 careful + freeze。 |
| `/unfreeze` | 移除目录编辑限制。 |
| `/gstack-upgrade` | 将 gstack 更新到最新版本。 |

## 构建命令

```bash
bun install              # 安装依赖
bun test                 # 运行测试（免费，<5s）
bun run build            # 生成文档 + 编译二进制文件
bun run gen:skill-docs   # 从模板再生成 SKILL.md 文件
bun run skill:check      # 所有技能的健康仪表板
```

## 关键约定

- SKILL.md 文件是从 `.tmpl` 模板**生成的**。编辑模板，不是输出。
- 运行 `bun run gen:skill-docs --host codex` 来重新生成 Codex 特定输出。
- browse 二进制提供无头浏览器访问。在技能中使用 `$B <command>`。
- 安全技能（careful、freeze、guard）使用内联咨询文本 — 在破坏性操作之前始终确认。
