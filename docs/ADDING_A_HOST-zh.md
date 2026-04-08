# 向 gstack 添加新主机

gstack 使用声明式主机配置系统。每个受支持的 AI 编码智能体
（Claude、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw）都定义为
一个类型化的 TypeScript 配置对象。添加新主机意味着创建一个文件
并重新导出它。对生成器、设置或工具没有任何代码更改。

## 工作原理

```
hosts/
├── claude.ts        # 主要主机
├── codex.ts         # OpenAI Codex CLI
├── factory.ts       # Factory Droid
├── kiro.ts          # Amazon Kiro
├── opencode.ts      # OpenCode
├── slate.ts         # Slate (Random Labs)
├── cursor.ts        # Cursor
├── openclaw.ts      # OpenClaw（混合：配置 + 适配器）
└── index.ts         # 注册表：导入全部，派生主机类型
```

每个配置文件导出一个 `HostConfig` 对象，告诉生成器：
- 在哪里放置生成的技能（路径）
- 如何转换前置信息（允许列表/拒绝列表字段）
- 要重写哪些 Claude 特定引用（路径、工具名称）
- 要检测哪个二进制文件以进行自动安装
- 哪些解析器部分要抑制
- 在安装时要符号链接哪些资产

生成器、设置脚本、平台检测、卸载、运行状况检查、worktree
复制和测试都从这些配置读取。其中没有一个有主机特定代码。

## 逐步：添加新主机

### 1. 创建配置文件

复制现有配置作为起点。`hosts/opencode.ts` 是一个很好的
最小化示例。`hosts/factory.ts` 显示工具重写和条件字段。
`hosts/openclaw.ts` 显示具有不同工具模型的主机的适配器模式。

创建 `hosts/myhost.ts`：

```typescript
import type { HostConfig } from '../scripts/host-config';

const myhost: HostConfig = {
  name: 'myhost',
  displayName: 'MyHost',
  cliCommand: 'myhost',        // 用于 `command -v` 检测的二进制名称
  cliAliases: [],              // 替代二进制名称

  globalRoot: '.myhost/skills/gstack',
  localSkillRoot: '.myhost/skills/gstack',
  hostSubdir: '.myhost',
  usesEnvVars: true,           // 仅 Claude 为 false（使用文字 ~ 路径）

  frontmatter: {
    mode: 'allowlist',         // 'allowlist' 仅保留列出的字段
    keepFields: ['name', 'description'],
    descriptionLimit: null,    // 为有限制的主机设置为 1024
  },

  generation: {
    generateMetadata: false,   // 仅 Codex 为 true（openai.yaml）
    skipSkills: ['codex'],     // codex 技能仅限 Claude
  },

  pathRewrites: [
    { from: '~/.claude/skills/gstack', to: '~/.myhost/skills/gstack' },
    { from: '.claude/skills/gstack', to: '.myhost/skills/gstack' },
    { from: '.claude/skills', to: '.myhost/skills' },
  ],

  runtimeRoot: {
    globalSymlinks: ['bin', 'browse/dist', 'browse/bin', 'gstack-upgrade', 'ETHOS.md'],
    globalFiles: { 'review': ['checklist.md', 'TODOS-format.md'] },
  },

  install: {
    prefixable: false,
    linkingStrategy: 'symlink-generated',
  },

  learningsMode: 'basic',
};

export default myhost;
```

### 2. 在索引中注册

编辑 `hosts/index.ts`：

```typescript
import myhost from './myhost';

// 添加到 ALL_HOST_CONFIGS 数组：
export const ALL_HOST_CONFIGS: HostConfig[] = [
  claude, codex, factory, kiro, opencode, slate, cursor, openclaw, myhost
];

// 添加到重新导出：
export { claude, codex, factory, kiro, opencode, slate, cursor, openclaw, myhost };
```

### 3. 添加到 .gitignore

将 `.myhost/` 添加到 `.gitignore`（生成的技能文档被忽略）。

### 4. 生成并验证

```bash
# 为新主机生成技能文档
bun run gen:skill-docs --host myhost

# 验证输出存在且没有 .claude/skills 泄露
ls .myhost/skills/gstack-*/SKILL.md
grep -r ".claude/skills" .myhost/skills/ | head -5
# （应为空）

# 为所有主机生成（包含新主机）
bun run gen:skill-docs --host all

# 运行状况仪表板显示新主机
bun run skill:check
```

### 5. 运行测试

```bash
bun test test/gen-skill-docs.test.ts
bun test test/host-config.test.ts
```

参数化的烟雾测试自动处理新主机。不需要编写零测试
代码。他们验证：输出存在、没有路径泄露、有效的前置信息、
新鲜度检查通过、排除 codex 技能。

### 6. 更新 README.md

在适当的章节中为新主机添加安装说明。

## 配置字段参考

查看 `scripts/host-config.ts` 以获得完整的 `HostConfig` 接口，其中包含
每个字段的 JSDoc 注释。

关键字段：

| 字段 | 目的 |
|------|------|
| `frontmatter.mode` | `allowlist`（仅保留列出的）或 `denylist`（剥离列出的）|
| `frontmatter.descriptionLimit` | 最大字符数，`null` 表示无限制 |
| `frontmatter.descriptionLimitBehavior` | `error`（失败构建）、`truncate`、`warn` |
| `frontmatter.conditionalFields` | 基于模板值添加字段（例如，敏感 → 禁用模型调用）|
| `frontmatter.renameFields` | 重命名模板字段（例如，语音触发器 → 触发器）|
| `pathRewrites` | 内容的文字 replaceAll。顺序很重要。|
| `toolRewrites` | 重写 Claude 工具名称（例如，"使用 Bash 工具" → "运行此命令"）|
| `suppressedResolvers` | 为此主机返回空的解析器函数 |
| `coAuthorTrailer` | 提交的 Git 合著者字符串 |
| `boundaryInstruction` | 跨模型调用的反提示注入警告 |
| `adapter` | 用于复杂转换的适配器模块的路径 |

## 适配器模式（对于具有不同工具模型的主机）

如果字符串替换工具重写还不够（主机的工具语义截然不同），
请使用适配器模式。请参阅 `hosts/openclaw.ts`
和 `scripts/host-adapters/openclaw-adapter.ts`。

适配器作为所有通用重写之后的后处理步骤运行。它
导出 `transform(content: string, config: HostConfig): string`。

## 验证

`scripts/host-config.ts` 中的 `validateHostConfig()` 函数检查：
- 名称：小写字母数字且带连字符
- CLI 命令：字母数字且带连字符/下划线
- 路径：仅安全字符（字母数字、`.`、`/`、`$`、`{}`、`~`、`-`、`_`）
- 跨配置没有重复的名称、主机子目录或全局根目录

运行 `bun run scripts/host-config-export.ts validate` 来检查所有配置。
