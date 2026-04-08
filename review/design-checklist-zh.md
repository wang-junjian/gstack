# 设计审查清单（精简版）

> **DESIGN_METHODOLOGY的子集** — 添加项目时，也更新 `scripts/gen-skill-docs.ts` 中的 `generateDesignMethodology()`，反之亦然。

## 说明

此清单适用于**diff中的源代码** — 不是渲染输出。读每个更改的前端文件（完整文件，不仅仅是diff块）并标记反模式。

**触发器：** 仅当diff涉及前端文件时运行此清单。使用 `gstack-diff-scope` 检测：

```bash
source <(~/.claude/skills/gstack/bin/gstack-diff-scope <base> 2>/dev/null)
```

如果 `SCOPE_FRONTEND=false`，静默跳过整个设计审查。

**DESIGN.md校准：** 如果 `DESIGN.md` 或 `design-system.md` 存在于项目根目录，首先阅读它。所有发现都根据项目所述设计系统进行校准。DESIGN.md中明确祝福的模式不被标记。如果不存在DESIGN.md，使用通用设计原则。

---

## 信心层

每个项目都使用置信度级别标记：

- **[HIGH]** — 通过grep/模式匹配可靠检测。明确的发现。
- **[MEDIUM]** — 通过模式聚合或启发式检测。标记为发现但预期一些噪音。
- **[LOW]** — 需要理解视觉意图。作为"可能的问题 — 目视验证或运行/design-review"显示。

---

## 分类

**AUTO-FIX**（仅机械CSS修复 — HIGH置信度，无设计判断需要）：
- `outline: none` 不替代 → 添加 `outline: revert` 或 `&:focus-visible { outline: 2px solid currentColor; }`
- 新CSS中的 `!important` → 移除并修复特异性
- `font-size` < 16px 在正文上 → 提升到16px

**ASK**（其他所有东西 — 需要设计判断）：
- 所有AI泥泞发现、排版结构、间距选择、交互状态空隙、DESIGN.md违规

**LOW置信度项** → 作为"可能：[描述]。目视验证或运行/design-review。"显示。永不AUTO-FIX。

---

## 输出格式

```
设计审查：N问题（X自动可修复，Y需要输入，Z可能）

**自动修复：**
- [file:line] 问题 → 已应用修复

**需要输入：**
- [file:line] 问题描述
  建议修复：建议的修复

**可能（目视验证）：**
- [file:line] 可能的问题 — 用/design-review验证
```

可选：`test_stub` — 使用项目的测试框架的此发现的骨架测试代码。

如果未发现问题：`设计审查：未发现问题。`

如果未更改前端文件：静默跳过，无输出。

---

## 类别

### 1. AI泥泞检测（6项） — 最高优先级

这些是没有受尊重的工作室的设计师会运送的AI生成UI的明确标志。

- **[MEDIUM]** 紫色/紫罗兰/靛蓝渐变背景或蓝对紫色方案。寻找 `linear-gradient` 在 `#6366f1`–`#8b5cf6` 范围内的值，或CSS自定义属性解析为紫色/紫罗兰。

- **[LOW]** 3列功能网格：彩色圆形中的图标+粗体标题+2行描述，重复3次对称。寻找恰好有3个子项的网格/flex容器，每个包含一个圆形元素+标题+段落。

- **[LOW]** 图标在彩色圆形中作为部分装饰。寻找 `border-radius: 50%` + 用作图标装饰容器的背景颜色的元素。

- **[HIGH]** 中心所有东西：所有标题、描述和卡片上的 `text-align: center`。Grep `text-align: center` 密度 — 如果>60%的文本容器使用中心对齐，标记它。

- **[MEDIUM]** 每个元素上统一的泡沫border-radius：大半径（16px+）统一应用于卡片、按钮、输入、容器。聚合 `border-radius` 值 — 如果>80%使用相同值≥16px，标记它。

- **[MEDIUM]** 通用英雄副本："欢迎来到[X]"、"释放...的力量"、"您的...一体化解决方案"、"革命化您的..."、"精简您的工作流程"。Grep HTML/JSX内容这些模式。

### 2. 排版（4项）

- **[HIGH]** 正文 `font-size` < 16px。在 `body`、`p`、`.text` 或基础样式上Grep `font-size` 声明。16px以下的值（或当base是16px时的1rem）被标记。

- **[HIGH]** 在diff中引入了超过3个字体家族。计数不同的 `font-family` 声明。如果>3个唯一家族出现在更改的文件中，标记。

- **[HIGH]** 标题层次跳过级别：`h1` 后跟 `h3` 在同一文件/组件中没有 `h2`。检查HTML/JSX标题标签。

- **[HIGH]** 黑名单字体：Papyrus、Comic Sans、Lobster、Impact、Jokerman。Grep `font-family` 这些名称。

### 3. 间距和布局（4项）

- **[MEDIUM]** 当DESIGN.md指定间距范围时，不在4px或8px范围内的任意间距值。检查 `margin`、`padding`、`gap` 值对照所述范围。仅当DESIGN.md定义范围时标记。

- **[MEDIUM]** 固定宽度不响应处理：容器上的 `width: NNNpx` 不带 `max-width` 或 `@media` 断点。移动设备上水平滚动的风险。

- **[MEDIUM]** 文本容器缺失 `max-width`：正文文本或段落容器不设 `max-width`，允许>75字符的行。检查文本包装提的 `max-width`。

- **[HIGH]** 新CSS规则中的 `!important`。在添加的行中Grep `!important`。几乎总是应该正确修复的特异性逃脱舱。

### 4. 交互状态（3项）

- **[MEDIUM]** 交互元素（按钮、链接、输入）缺失悬停/焦点状态。检查新交互元素样式是否存在 `:hover` 和 `:focus` 或 `:focus-visible` 伪类。

- **[HIGH]** `outline: none` 或 `outline: 0` 不替代焦点指示器。Grep `outline:\s*none` 或 `outline:\s*0`。这移除了键盘可访问性。

- **[LOW]** 交互元素上的触摸目标< 44px。检查按钮和链接上的 `min-height`/`min-width`/`padding`。需要从多个属性计算有效大小 — 代码低置信度。

### 5. DESIGN.md违规（3项，条件性）

仅当 `DESIGN.md` 或 `design-system.md` 存在于项目根目录时应用：

- **[MEDIUM]** 颜色不在所述调色板中。比较更改CSS中的颜色值对照DESIGN.md中定义的调色板。

- **[MEDIUM]** 字体不在所述排版部分中。比较 `font-family` 值对照DESIGN.md的字体列表。

- **[MEDIUM]** 间距值在所述范围之外。比较 `margin`/`padding`/`gap` 值对照DESIGN.md的间距范围。

---

## 抑制

不要标记：
- DESIGN.md中明确文档化为故意选择的模式
- 第三方/厂商CSS文件（node_modules、供应商目录）
- CSS重置或规范化样式表
- 测试夹具文件
- 生成/压缩的CSS
