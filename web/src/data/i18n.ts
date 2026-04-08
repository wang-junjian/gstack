export const zhText = {
  title: "gstack 专家团队",
  subtitle: "AI 工程工作流：从想法到发布",
  sprintPhases: ["思考", "规划", "构建", "审查", "测试", "发布", "反思"],
  viewExpert: "查看专家",
  back: "返回",
  skills: "技能",
  skillContent: "技能详情",
  loading: "加载中...",
  description: "描述",
  stepBy: "冲刺工作流",
  learnMore: "了解更多",
  english: "英文",
  chinese: "中文",
  
  experts: {
    "office-hours": {
      title: "YC 办公时间",
      role: "产品顾问",
      stage: "思考",
      description: "从这里开始。六个强制问题，在你编写代码之前重新框架化你的产品。对你的框架提出反对，质疑前提，生成实现替代方案。",
      skills: ["产品思维", "框架重塑", "前提质疑", "方案生成", "设计文档写作"],
      skillPath: "office-hours"
    },
    "plan-ceo-review": {
      title: "CEO / 创始人",
      role: "战略审查",
      stage: "规划",
      description: "重新思考问题。找到隐藏在请求中的 10 星级产品。四个模式：扩展、选择性扩展、保留范围、缩减。",
      skills: ["战略思维", "范围管理", "产品定位", "风险评估", "优先级决策"],
      skillPath: "plan-ceo-review"
    },
    "plan-eng-review": {
      title: "工程经理",
      role: "架构审查",
      stage: "规划",
      description: "锁定架构、数据流、图表、边界情况和测试。将隐藏的假设强制显露。",
      skills: ["架构设计", "数据流分析", "边界情况识别", "测试规划", "风险评估"],
      skillPath: "plan-eng-review"
    },
    "plan-design-review": {
      title: "高级设计师",
      role: "设计审查",
      stage: "规划",
      description: "将每个设计维度评分 0-10，解释 10 分是什么样子，然后编辑计划以实现。AI 垃圾检测。",
      skills: ["视觉设计", "用户体验", "设计评分", "迭代改进", "AI 质量检测"],
      skillPath: "plan-design-review"
    },
    "plan-devex-review": {
      title: "开发者体验主管",
      role: "DX 审查",
      stage: "规划",
      description: "交互式 DX 审查：探索开发者角色，对标竞争对手的 TTHW，设计你的神奇时刻，逐步跟踪摩擦点。",
      skills: ["开发者体验设计", "竞争分析", "入门流程优化", "摩擦点识别", "文档评估"],
      skillPath: "plan-devex-review"
    },
    "design-consultation": {
      title: "设计合作伙伴",
      role: "设计系统建立",
      stage: "构建",
      description: "从头开始构建完整的设计系统。研究景观，提出创意风险，生成逼真的产品模型。",
      skills: ["设计系统搭建", "景观研究", "原型设计", "创意风险识别", "模型生成"],
      skillPath: "design-consultation"
    },
    "design-html": {
      title: "HTML/CSS 工程师",
      role: "可访问 HTML 标记",
      stage: "构建",
      description: "将设计规范转换为语义化、可访问的 HTML。WCAG AA、标题层次、ARIA 标签、键盘导航。",
      skills: ["HTML5 标记", "CSS 样式", "可访问性", "语义 HTML", "ARIA 实现"],
      skillPath: "design-html"
    },
    "review": {
      title: "员工工程师",
      role: "代码审查",
      stage: "审查",
      description: "找到通过 CI 但在生产中炸裂的错误。自动修复明显的错误。标记完整性差距。",
      skills: ["代码审查", "性能分析", "安全检查", "自动修复", "完整性检测"],
      skillPath: "review"
    },
    "investigate": {
      title: "调试者",
      role: "根本原因调试",
      stage: "审查",
      description: "系统根本原因调试。铁律：不调查就没修复。跟踪数据流、测试假设、在 3 次失败后停止。",
      skills: ["问题诊断", "数据流追踪", "假设测试", "逻辑推理", "问题解决"],
      skillPath: "investigate"
    },
    "design-review": {
      title: "编码的设计师",
      role: "设计审查与修复",
      stage: "审查",
      description: "与 /plan-design-review 相同的审计，然后修复发现的内容。原子提交、前后截图。",
      skills: ["设计审计", "视觉改进", "交互优化", "原子提交", "对比分析"],
      skillPath: "design-review"
    },
    "devex-review": {
      title: "DX 测试员",
      role: "开发者体验审计",
      stage: "审查",
      description: "实时开发者体验审计。实际测试你的入门：导航文档、尝试入门流程、计时 TTHW、截图错误。",
      skills: ["实际测试", "文档审查", "入门流程验证", "性能计时", "错误截图"],
      skillPath: "devex-review"
    },
    "qa": {
      title: "QA 主管",
      role: "测试与修复",
      stage: "测试",
      description: "测试你的应用，找到错误，用原子提交修复它们，重新验证。为每个修复自动生成回归测试。",
      skills: ["功能测试", "错误发现", "修复验证", "回归测试生成", "质量保证"],
      skillPath: "qa"
    },
    "qa-only": {
      title: "QA 报告者",
      role: "测试报告",
      stage: "测试",
      description: "与 /qa 相同的方法论但仅报告。纯错误报告，不进行代码更改。",
      skills: ["错误报告", "测试记录", "问题分类", "优先级排序", "文档撰写"],
      skillPath: "qa-only"
    },
    "ship": {
      title: "发布工程师",
      role: "代码发布",
      stage: "发布",
      description: "同步 main、运行测试、审计覆盖率、推送、打开 PR。如果你没有测试框架，从头引导。",
      skills: ["Git 管理", "测试运行", "覆盖率审计", "PR 创建", "框架引导"],
      skillPath: "ship"
    },
    "land-and-deploy": {
      title: "发布工程师",
      role: "部署上线",
      stage: "发布",
      description: "合并 PR、等待 CI 和部署、验证生产健康。从\"已批准\"到\"在生产中验证\"一个命令。",
      skills: ["PR 合并", "CI/CD 管理", "部署验证", "生产监控", "健康检查"],
      skillPath: "land-and-deploy"
    },
    "canary": {
      title: "SRE",
      role: "部署监控",
      stage: "发布",
      description: "部署后监控循环。监视控制台错误、性能回归和页面故障。",
      skills: ["错误监控", "性能跟踪", "页面可用性", "告警设置", "趋势分析"],
      skillPath: "canary"
    },
    "document-release": {
      title: "技术文档编写者",
      role: "文档更新",
      stage: "反思",
      description: "更新所有项目文档以匹配你刚发布的内容。自动捕获过期的 README。",
      skills: ["文档写作", "内容更新", "版本管理", "README 维护", "过期检测"],
      skillPath: "document-release"
    },
    "retro": {
      title: "工程经理",
      role: "回顾反思",
      stage: "反思",
      description: "团队感知的每周回顾。每个人的分解、发布连胜、测试健康趋势、增长机会。",
      skills: ["团队反思", "数据分析", "趋势识别", "增长规划", "过程改进"],
      skillPath: "retro"
    },
    "browse": {
      title: "QA 工程师",
      role: "浏览器助手",
      stage: "测试",
      description: "给智能体眼睛。真实 Chromium 浏览器、真实点击、真实截图。~100ms 每个命令。",
      skills: ["浏览器自动化", "截图捕获", "点击交互", "DOM 分析", "页面导航"],
      skillPath: "browse"
    },
    "setup-browser-cookies": {
      title: "会话管理员",
      role: "身份验证设置",
      stage: "测试",
      description: "从你的真实浏览器（Chrome、Arc、Brave、Edge）导入 Cookie 到无头会话。测试经过身份验证的页面。",
      skills: ["Cookie 管理", "会话导入", "身份验证测试", "浏览器同步", "安全存储"],
      skillPath: "setup-browser-cookies"
    },
    "cso": {
      title: "首席安全官",
      role: "安全审计",
      stage: "审查",
      description: "OWASP 十大 + STRIDE 威胁模型。零噪音：17 个假阳性排除、8/10+ 置信门、独立发现验证。",
      skills: ["威胁建模", "漏洞扫描", "安全审计", "OWASP 分析", "修复验证"],
      skillPath: "cso"
    },
    "autoplan": {
      title: "审查流程",
      role: "自动规划",
      stage: "审查",
      description: "一个命令，完全审查的计划。自动运行 CEO → 设计 → 工程审查，包含编码的决策原则。",
      skills: ["自动化流程", "多维度审查", "决策原则编码", "审查聚合", "智能路由"],
      skillPath: "autoplan"
    },
    "benchmark": {
      title: "性能工程师",
      role: "性能基准",
      stage: "审查",
      description: "基准页面加载时间、Core Web Vitals 和资源大小。在每个 PR 上比较前后。",
      skills: ["性能测试", "基准建立", "指标收集", "对比分析", "优化建议"],
      skillPath: "benchmark"
    }
  }
};

export const enText = {
  title: "gstack Expert Team",
  subtitle: "AI Engineering Workflow: From Idea to Ship",
  sprintPhases: ["Think", "Plan", "Build", "Review", "Test", "Ship", "Reflect"],
  viewExpert: "View Expert",
  back: "Back",
  skills: "Skills",
  skillContent: "Skill Details",
  loading: "Loading...",
  description: "Description",
  stepBy: "Sprint Workflow",
  learnMore: "Learn More",
  english: "English",
  chinese: "Chinese",
  
  experts: {
    "office-hours": {
      title: "YC Office Hours",
      role: "Product Advisor",
      stage: "Think",
      description: "Start here. Six forcing questions that reframe your product before you write code. Pushes back on your framework, challenges premises, generates implementation alternatives.",
      skills: ["Product Thinking", "Framework Reframing", "Premise Challenging", "Solution Generation", "Design Documentation"],
      skillPath: "office-hours"
    },
    "plan-ceo-review": {
      title: "CEO / Founder",
      role: "Strategic Review",
      stage: "Plan",
      description: "Rethink the problem. Find the 10-star product hiding inside the request. Four modes: Expansion, Selective Expansion, Hold Scope, Reduction.",
      skills: ["Strategic Thinking", "Scope Management", "Product Positioning", "Risk Assessment", "Priority Decision"],
      skillPath: "plan-ceo-review"
    },
    "plan-eng-review": {
      title: "Eng Manager",
      role: "Architecture Review",
      stage: "Plan",
      description: "Lock in architecture, data flow, diagrams, edge cases, and tests. Forces hidden assumptions into the open.",
      skills: ["Architecture Design", "Data Flow Analysis", "Edge Case Identification", "Test Planning", "Risk Assessment"],
      skillPath: "plan-eng-review"
    },
    "plan-design-review": {
      title: "Senior Designer",
      role: "Design Review",
      stage: "Plan",
      description: "Rates each design dimension 0-10, explains what a 10 looks like, then edits the plan to get there. AI Slop detection.",
      skills: ["Visual Design", "User Experience", "Design Rating", "Iterative Improvement", "AI Quality Detection"],
      skillPath: "plan-design-review"
    },
    "plan-devex-review": {
      title: "Developer Experience Lead",
      role: "DX Review",
      stage: "Plan",
      description: "Interactive DX review: explores developer personas, benchmarks against competitors' TTHW, designs your magical moment, traces friction points step by step.",
      skills: ["Developer Experience Design", "Competitive Analysis", "Onboarding Optimization", "Friction Point Identification", "Documentation Evaluation"],
      skillPath: "plan-devex-review"
    },
    "design-consultation": {
      title: "Design Partner",
      role: "Design System Building",
      stage: "Build",
      description: "Build a complete design system from scratch. Researches the landscape, proposes creative risks, generates realistic product mockups.",
      skills: ["Design System Creation", "Landscape Research", "Prototype Design", "Creative Risk Identification", "Mockup Generation"],
      skillPath: "design-consultation"
    },
    "design-html": {
      title: "HTML/CSS Engineer",
      role: "Accessible HTML Markup",
      stage: "Build",
      description: "Convert design specs into semantic, accessible HTML. WCAG AA, heading hierarchy, ARIA labels, keyboard navigation.",
      skills: ["HTML5 Markup", "CSS Styling", "Accessibility", "Semantic HTML", "ARIA Implementation"],
      skillPath: "design-html"
    },
    "review": {
      title: "Staff Engineer",
      role: "Code Review",
      stage: "Review",
      description: "Find the bugs that pass CI but blow up in production. Auto-fixes the obvious ones. Flags completeness gaps.",
      skills: ["Code Review", "Performance Analysis", "Security Check", "Auto-fixing", "Completeness Detection"],
      skillPath: "review"
    },
    "investigate": {
      title: "Debugger",
      role: "Root Cause Debugging",
      stage: "Review",
      description: "Systematic root-cause debugging. Iron Law: no fixes without investigation. Traces data flow, tests hypotheses, stops after 3 failed fixes.",
      skills: ["Issue Diagnosis", "Data Flow Tracing", "Hypothesis Testing", "Logic Reasoning", "Problem Solving"],
      skillPath: "investigate"
    },
    "design-review": {
      title: "Designer Who Codes",
      role: "Design Review & Fix",
      stage: "Review",
      description: "Same audit as /plan-design-review, then fixes what it finds. Atomic commits, before/after screenshots.",
      skills: ["Design Audit", "Visual Improvement", "Interaction Optimization", "Atomic Commits", "Comparative Analysis"],
      skillPath: "design-review"
    },
    "devex-review": {
      title: "DX Tester",
      role: "Developer Experience Audit",
      stage: "Review",
      description: "Live developer experience audit. Actually tests your onboarding: navigates docs, tries the getting started flow, times TTHW, screenshots errors.",
      skills: ["Actual Testing", "Documentation Review", "Onboarding Verification", "Performance Timing", "Error Screenshots"],
      skillPath: "devex-review"
    },
    "qa": {
      title: "QA Lead",
      role: "Testing & Fixing",
      stage: "Test",
      description: "Test your app, find bugs, fix them with atomic commits, re-verify. Auto-generates regression tests for every fix.",
      skills: ["Functional Testing", "Bug Finding", "Fix Verification", "Regression Testing", "Quality Assurance"],
      skillPath: "qa"
    },
    "qa-only": {
      title: "QA Reporter",
      role: "Test Reporting",
      stage: "Test",
      description: "Same methodology as /qa but report only. Pure bug report without code changes.",
      skills: ["Bug Reporting", "Test Documentation", "Issue Classification", "Priority Ranking", "Documentation Writing"],
      skillPath: "qa-only"
    },
    "ship": {
      title: "Release Engineer",
      role: "Code Release",
      stage: "Ship",
      description: "Sync main, run tests, audit coverage, push, open PR. Bootstraps test frameworks if you don't have one.",
      skills: ["Git Management", "Test Execution", "Coverage Audit", "PR Creation", "Framework Bootstrapping"],
      skillPath: "ship"
    },
    "land-and-deploy": {
      title: "Release Engineer",
      role: "Deploy & Launch",
      stage: "Ship",
      description: "Merge the PR, wait for CI and deploy, verify production health. One command from \"approved\" to \"verified in production.\"",
      skills: ["PR Merging", "CI/CD Management", "Deploy Verification", "Production Monitoring", "Health Check"],
      skillPath: "land-and-deploy"
    },
    "canary": {
      title: "SRE",
      role: "Deployment Monitoring",
      stage: "Ship",
      description: "Post-deploy monitoring loop. Watches for console errors, performance regressions, and page failures.",
      skills: ["Error Monitoring", "Performance Tracking", "Page Availability", "Alert Setup", "Trend Analysis"],
      skillPath: "canary"
    },
    "document-release": {
      title: "Technical Writer",
      role: "Documentation Update",
      stage: "Reflect",
      description: "Update all project docs to match what you just shipped. Catches stale READMEs automatically.",
      skills: ["Documentation Writing", "Content Updates", "Version Management", "README Maintenance", "Stale Checking"],
      skillPath: "document-release"
    },
    "retro": {
      title: "Eng Manager",
      role: "Retrospective Reflection",
      stage: "Reflect",
      description: "Team-aware weekly retro. Per-person breakdowns, shipping streaks, test health trends, growth opportunities.",
      skills: ["Team Reflection", "Data Analysis", "Trend Identification", "Growth Planning", "Process Improvement"],
      skillPath: "retro"
    },
    "browse": {
      title: "QA Engineer",
      role: "Browser Assistant",
      stage: "Test",
      description: "Give the agent eyes. Real Chromium browser, real clicks, real screenshots. ~100ms per command.",
      skills: ["Browser Automation", "Screenshot Capture", "Click Interaction", "DOM Analysis", "Page Navigation"],
      skillPath: "browse"
    },
    "setup-browser-cookies": {
      title: "Session Manager",
      role: "Authentication Setup",
      stage: "Test",
      description: "Import cookies from your real browser (Chrome, Arc, Brave, Edge) into the headless session. Test authenticated pages.",
      skills: ["Cookie Management", "Session Import", "Authentication Testing", "Browser Sync", "Secure Storage"],
      skillPath: "setup-browser-cookies"
    },
    "cso": {
      title: "Chief Security Officer",
      role: "Security Audit",
      stage: "Review",
      description: "OWASP Top 10 + STRIDE threat model. Zero-noise: 17 false positive exclusions, 8/10+ confidence gate, independent finding verification.",
      skills: ["Threat Modeling", "Vulnerability Scanning", "Security Audit", "OWASP Analysis", "Fix Verification"],
      skillPath: "cso"
    },
    "autoplan": {
      title: "Review Pipeline",
      role: "Automatic Planning",
      stage: "Review",
      description: "One command, fully reviewed plan. Runs CEO → design → eng review automatically with encoded decision principles.",
      skills: ["Automation Pipeline", "Multi-dimensional Review", "Encoded Decision Principles", "Review Aggregation", "Smart Routing"],
      skillPath: "autoplan"
    },
    "benchmark": {
      title: "Performance Engineer",
      role: "Performance Baseline",
      stage: "Review",
      description: "Baseline page load times, Core Web Vitals, and resource sizes. Compare before/after on every PR.",
      skills: ["Performance Testing", "Baseline Establishment", "Metric Collection", "Comparative Analysis", "Optimization Suggestion"],
      skillPath: "benchmark"
    }
  }
};
