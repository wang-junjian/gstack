# 设计系统 — gstack

## 产品背景
- **这是什么：** gstack 社区网站 — 一个 CLI 工具，将 Claude Code 转变为虚拟工程团队
- **为谁设计：** 发现 gstack 的开发者、现有社区成员
- **所在领域：** 开发者工具（同类：Linear、Raycast、Warp、Zed）
- **项目类型：** 社区仪表板 + 营销网站

## 美学方向
- **方向：** 工业/功利主义 — 功能优先、数据密集、等宽字体作为个性化字体
- **装饰级别：** 有意为之 — 表面上有细微的噪点/纹理以增加物质感
- **氛围：** 由专业人士构建的严肃工具。温暖，不冷漠。CLI 传承是品牌的一部分。
- **参考网站：** formulae.brew.sh（竞争对手，但我们的是实际的和交互式的）、Linear（深色 + 克制）、Warp（温暖的重点）

## 排版
- **显示/英雄：** Satoshi（Black 900 / Bold 700）— 几何型且温暖，有独特的字形（小写字母 'a' 和 'g'）。不是 Inter，不是 Geist。从 Fontshare CDN 加载。
- **正文：** DM Sans（Regular 400 / Medium 500 / Semibold 600）— 干净、易读、比几何显示字体更友好。从 Google Fonts 加载。
- **UI/标签：** DM Sans（与正文相同）
- **数据/表格：** JetBrains Mono（Regular 400 / Medium 500）— 个性化字体。支持表格数字。等宽字体应该突出显示，而不是隐藏在代码块中。从 Google Fonts 加载。
- **代码：** JetBrains Mono
- **加载：** 从 Google Fonts 加载 DM Sans + JetBrains Mono，从 Fontshare 加载 Satoshi。使用 `display=swap`。
- **大小：**
  - 英雄：72px / clamp(40px, 6vw, 72px)
  - H1：48px
  - H2：32px
  - H3：24px
  - H4：18px
  - 正文：16px
  - 小：14px
  - 标题：13px
  - 微观：12px
  - 纳秒：11px（JetBrains Mono 标签）

## 颜色
- **方法：** 克制 — 琥珀色重点很少见且有意义。仪表板数据占据颜色；框架保持中性。
- **主色（深色模式）：** amber-500 #F59E0B — 温暖、充满活力、看起来像"终端光标"
- **主色（浅色模式）：** amber-600 #D97706 — 更深以对比白色背景
- **主色文本重点（深色模式）：** amber-400 #FBBF24
- **主色文本重点（浅色模式）：** amber-700 #B45309
- **中性色：** 酷灰色
  - zinc-50：#FAFAFA（最浅）
  - zinc-400：#A1A1AA
  - zinc-600：#52525B
  - zinc-800：#27272A
  - 表面（深色）：#141414
  - 基础（深色）：#0C0C0C
  - 表面（浅色）：#FFFFFF
  - 基础（浅色）：#FAFAF9
- **语义色：** 成功 #22C55E、警告 #F59E0B、错误 #EF4444、信息 #3B82F6
- **深色模式：** 默认。近黑色基础（#0C0C0C）、浅色卡片（#141414）、边框（#262626）。
- **浅色模式：** 温暖石色基础（#FAFAF9）、白色表面卡片、石色边框（#E7E5E4）。琥珀色重点转为 amber-600 以确保对比。

## 间距
- **基础单位：** 4px
- **密度：** 舒适 — 不拥挤（不是彭博终端），不宽敞（不是营销网站）
- **比例：** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## 布局
- **方法：** 网格-纪律化用于仪表板，编辑英雄用于登陆页面
- **网格：** lg+ 时 12 列，移动设备时 1 列
- **最大内容宽度：** 1200px（6xl）
- **边框半径：** sm:4px, md:8px, lg:12px, full:9999px
  - 卡片/面板：lg (12px)
  - 按钮/输入：md (8px)
  - 徽章/药丸：full (9999px)
  - 技能条：sm (4px)

## 动画
- **方法：** 最小-功能性 — 仅限帮助理解的过渡。仪表板的实时信息流就是动画。
- **缓动：** enter(ease-out / cubic-bezier(0.16,1,0.3,1)) exit(ease-in) move(ease-in-out)
- **持续时间：** micro(50-100ms) short(150ms) medium(250ms) long(400ms)
- **动画化元素：** 实时信息流点脉冲 (2s infinite)、技能条填充 (600ms ease-out)、悬停状态 (150ms)

## 纹理效果
在整个页面上应用细微噪点覆盖以增加物质感：
- 深色模式：不透明度 0.03
- 浅色模式：不透明度 0.02
- 使用 SVG feTurbulence 过滤器作为 body::after 上的 CSS background-image
- pointer-events: none, position: fixed, z-index: 9999

## 决定日志
| 日期 | 决定 | 原因 |
|------|------|------|
| 2026-03-21 | 初始设计系统 | 由 /design-consultation 创建。工业美学、温暖琥珀色重点、Satoshi + DM Sans + JetBrains Mono。 |
| 2026-03-21 | 浅色模式 amber-600 | amber-500 对白色背景太亮/褪色；amber-700 太棕/褐色。amber-600 是完美的折衷。 |
| 2026-03-21 | 纹理效果 | 为平面深色表面增加物质感。防止"通用 SaaS 模板"的单调感。 |
