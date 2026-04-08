# 致谢

/cso v2 受到安全审计领域广泛研究的启发。致谢对象包括：

- **[Sentry 安全审查](https://github.com/getsentry/skills)** — 基于信心度的报告系统（仅报告高置信度发现）和"研究前报告"方法论（追踪数据流、检查上游验证）验证了我们的8/10日常置信度门槛。TimOnWeb 评价它是测试过的5个安全技能中唯一值得安装的。
- **[Trail of Bits 技能](https://github.com/trailofbits/skills)** — 审计背景构建方法论（在搜索前建立心理模型）直接启发了第0阶段。他们的变异分析概念（发现一个漏洞？搜索整个代码库中相同的模式）启发了第12阶段的变异分析步骤。
- **[Shannon by Keygraph](https://github.com/KeygraphHQ/shannon)** — 自主AI笔测试员在XBOW基准上达到96.15%（100/104漏洞）。验证了AI可以进行真实的安全测试，而不仅仅是清单扫描。我们的第12阶段主动验证是Shannon进行现场测试的静态分析版本。
- **[afiqiqmal/claude-security-audit](https://github.com/afiqiqmal/claude-security-audit)** — AI/LLM特定的安全检查（提示注入、RAG中毒、工具调用权限）启发了第7阶段。他们的框架级自动检测（检测"Next.js"而不是仅"Node/TypeScript"）启发了第0阶段的框架检测步骤。
- **[Snyk ToxicSkills 研究](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)** — 发现36%的AI智能体技能有安全缺陷、13.4%是恶意的，这启发了第8阶段（技能供应链扫描）。
- **[Daniel Miessler 个人AI基础设施](https://github.com/danielmiessler/Personal_AI_Infrastructure)** — 事件响应行动手册和保护文件概念为补救和LLM安全阶段提供了信息。
- **[McGo/claude-code-security-audit](https://github.com/McGo/claude-code-security-audit)** — 生成可共享报告和可操作epic的想法为我们的报告格式演进提供了信息。
- **[Claude Code 安全包](https://dev.to/myougatheaxo/automate-owasp-security-audits-with-claude-code-security-pack-4mah)** — 模块化方法（单独的 /security-audit、/secret-scanner、/deps-check 技能）验证了这些是不同的问题。我们的统一方法牺牲了模块化性以换取跨阶段推理。
- **[Anthropic Claude Code 安全](https://www.anthropic.com/news/claude-code-security)** — 多阶段验证和信心评分验证了我们的并行发现验证方法。在开源中发现了500+零日。
- **[@gus_argon](https://x.com/gus_aragon/status/2035841289602904360)** — 确定了v1的关键盲点：没有堆栈检测（运行所有语言模式）、使用bash grep而不是Claude Code的Grep工具、`| head -20` 静默截断结果、前导代码膨胀。这些直接塑造了v2的堆栈优先方法和Grep工具强制要求。
