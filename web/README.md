# gstack 专家团队展示

一个 Next.js Web 应用，展示 gstack AI 工程专家团队和冲刺工作流程。支持 22 位专家，7 个阶段，双语展示。

> 🎯 **核心理念**：通过可视化冲刺工作流和专家卡片，让用户理解 gstack 的工程方法论。

## ✨ 功能特性

- **📊 可视化冲刺工作流** - 展示从思考到反思的 7 个阶段
- **👥 22 位专家展示** - 分类展示每个阶段的专家及技能
- **📄 专家详情页** - 直观查看 SKILL.md 内容和核心能力
- **🌐 双语支持** - 中文/英文无缝切换
- **📱 响应式设计** - 完美适配各种设备
- **🎨 主题化配置** - 集中管理阶段颜色和属性

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15 | 框架 |
| React | 19 | UI 库 |
| TypeScript | 5+ | 类型检查 |
| CSS Modules | - | 样式管理 |

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm / yarn / pnpm

### 3 步启动

```bash
# 1. 进入项目目录
cd web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 首页 - 展示所有专家
│   ├── page.module.css          # 首页样式
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 应用布局
│   ├── api/
│   │   └── skill/route.ts       # 获取 SKILL.md 文件的 API
│   └── experts/[id]/
│       ├── page.tsx             # 专家详情页
│       └── page.module.css      # 详情页样式
├── components/
│   ├── SprintFlow.tsx           # 冲刺流程可视化组件
│   ├── ExpertCard.tsx           # 专家卡片组件
│   ├── MarkdownRenderer.tsx     # Markdown 渲染器
│   ├── LanguageSwitcher.tsx     # 语言切换器
│   └── *.module.css             # 各组件样式
├── context/
│   └── LanguageContext.tsx      # 国际化状态管理
└── data/
    ├── i18n.ts                  # 国际化数据（22 位专家）
    └── stages.ts                # 冲刺阶段配置（单一真实来源）
```

## 🏗️ 架构设计

### 单一真实来源原则

系统采用 **single source of truth** 架构，避免数据重复维护：

```
stages.ts (阶段配置中心)
    ↓
    ├─→ SprintFlow.tsx  (读取颜色、顺序)
    └─→ page.tsx        (读取阶段列表)

i18n.ts (专家数据)
    ↓
    └─→ page.tsx  (根据 expert.stage 动态分组)
```

### 核心数据流

| 数据源 | 用途 | 文件 |
|-------|------|------|
| `stages.ts` | 阶段属性（颜色、顺序、名称） | SprintFlow, page |
| `i18n.ts` | 22 位专家及其信息 | page, ExpertCard |
| `expert.stage` | 专家所属阶段 | 自动分组和分类 |

## 🎯 常见操作

### ✨ 添加新专家

1. 编辑 `src/data/i18n.ts`
2. 在 `experts` 对象中添加新的专家条目：

```typescript
"new-expert": {
  title: "新专家名称",
  role: "角色描述",
  stage: "审查",  // 必须是 sprintPhases 中的某个值
  description: "描述文本",
  skills: ["技能1", "技能2"],
  skillPath: "new-expert"  // gstack 中对应的文件夹名
}
```

**完成！** 无需其他修改，新专家会自动：
- ✓ 出现在对应阶段区域
- ✓ 显示在 SprintFlow 中
- ✓ 获得正确的样式和颜色

### 🎨 修改阶段颜色

编辑 `src/data/stages.ts`，修改 `STAGES` 对象中的 `color` 字段：

```typescript
export const STAGES: Record<string, StageConfig> = {
  'think': {
    zhName: '思考',
    enName: 'Think',
    color: '#new-color',  // ← 改这里
    order: 1,
  },
  // ...
};
```

### 📝 修改阶段信息（名称、顺序）

1. **更新 `stages.ts`**
   ```typescript
   'think': {
     zhName: '思考',  // ← 改中文名
     enName: 'Think', // ← 改英文名
     order: 1,
   }
   ```

2. **更新 `i18n.ts` 的 `sprintPhases`**
   ```typescript
   sprintPhases: ["思考", "规划", ...],  // 名称必须匹配
   ```

3. **检查专家的 `stage` 字段是否匹配新名称**

### 🔄 添加新的冲刺阶段

1. 在 `stages.ts` 的 `STAGES` 中添加
2. 在 `i18n.ts` 的 `sprintPhases` 中添加
3. 为专家设置 `stage` 为新阶段名称

系统会自动处理渲染和分组。

### 🌐 修改语言文本

所有文本都在 `src/data/i18n.ts` 中：

```typescript
export const zhText = {
  title: "gstack 专家团队",  // ← 改这里
  // ...
}

export const enText = {
  title: "gstack Expert Team",  // ← 改这里
  // ...
}
```

## 💡 开发技巧

### 热重载开发模式

```bash
npm run dev
```

修改代码后浏览器会自动刷新，无需手动重启。

### 类型检查

```bash
npm run build  # 包含类型检查
```

或在编辑器中安装 TypeScript 插件实时检查。

### 调试 API

获取 SKILL 内容的 API 路由：

```
GET /api/skill?path=office-hours&lang=zh
```

返回：
```json
{
  "content": "# Office Hours...",
  "path": "office-hours",
  "language": "zh"
}
```

## 🧪 验证清单

在提交前检查：

- [ ] 新专家已添加到 `i18n.ts`
- [ ] 专家的 `stage` 字段与 `sprintPhases` 匹配
- [ ] 如果修改了 `stages.ts`，已更新 `sprintPhases`
- [ ] npm run build 无错误
- [ ] 浏览器访问正常

## ❓ 常见问题

### Q: 我添加的专家没有显示在首页
**A:** 检查几点：
1. `stage` 字段的值是否与 `sprintPhases` 中的某个值**完全相同**？
2. 有没有多余的空格或大小写错误？

### Q: 首页阶段区域是空的
**A:** 确保：
1. 至少有一个专家的 `stage` 等于该阶段名称
2. 该专家数据格式正确

### Q: 颜色不显示
**A:** 
1. 确认 `stages.ts` 中的颜色值是有效的 CSS 颜色
2. 清空浏览器缓存后重试

## 📚 导出和构建

```bash
# 生产构建
npm run build

# 启动生产服务器
npm start

# 分析构建大小
npm run build --analyze  # 需要安装分析工具
```

## 🔧 环境配置

复制 `.env.example` 创建 `.env.local`（如需自定义）：

```bash
cp .env.example .env.local
```

## 📖 更多资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)

---

**「整洁的代码来自清晰的架构。」** —— 单一真实来源原则
