---
name: review
preamble-tier: 4
version: 1.0.0
description: |
  着陆前PR审查。针对基础分支分析差异以检查SQL安全性、LLM信任
  边界违规、条件副作用和其他结构问题。当被问"审查这个PR"、
  "代码审查"、"着陆前审查"或"检查我的差异"时使用。
  在用户即将合并或着陆代码更改时主动建议。(gstack)
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
  - WebSearch
---

# 着陆前PR审查

分析审查差异以查找SQL注入、不安全的LLM调用、竞态条件、
权限提升路径和其他结构缺陷。

## 第1步：识别审查范围

```bash
# 获取基础分支
git fetch origin
BASE=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
echo "Base branch: $BASE"

# 计算差异
git diff origin/$BASE --stat
```

## 第2步：关键安全检查

**运行这些并显示结果：**

### SQL安全

```bash
# 查找raw SQL通过用户输入
git diff origin/$BASE | grep -E '(SELECT|INSERT|UPDATE|DELETE|DROP).*\$|f".*\{|f'"'"'.*\{|query\s*\+'
```

- 任何用户输入直接进入SQL？ 🚨 阻止
- 是否使用参数化查询？ ✅ 绿灯
- 新的数据库调用数：计数并标记任何新的原始SQL

### LLM边界

```bash
# 寻找助手调用
git diff origin/$BASE | grep -E 'assistant|claude|gpt|llm|model\.send|ai\.|chat\.\w+'
```

- 用户输入是否直接流向LLM？ 🚨 标记
- 是否有输入清理/转义？ ✅ 好的
- 模型约束是否明确？ 检查系统提示

### 竞态条件

```bash
# 寻找读-修改-写模式
git diff origin/$BASE | grep -B3 -A3 'get\|fetch\|find' | grep -E 'set\|update\|write\|save'
```

- 检查是否有原子操作（事务、锁、CAS）
- 分布式系统中的并发修改？ 🚨 标记

### 权限检查

```bash
# 寻找新的API端点或protected操作
git diff origin/$BASE | grep -E 'router\.\w+|@auth|@permission|def.*\(.*user|auth\.'
```

- 每个受保护的操作是否检查permission？
- 是否使用最少权限的原则？
- 用户可以跨越权限吗？

## 第3步：代码质量检查

- **死代码：** 未使用的导入、未调用的函数
- **类型缺失：** TypeScript中的any，Python中无类型提示
- **测试覆盖：** 新代码有测试吗？
- **文档：** 复杂逻辑有doc吗？
- **错误处理：** 是否处理边界情况？
- **性能：** 新的O(n²)或N+1查询？

## 第4步：架构检查

- **依赖方向：** 低级模块依赖高级模块？
- **耦合：** 变更强制级联更新吗？
- **可测试性：** 新代码易于单元测试吗？
- **可读性：** 新代码自我记录吗？

## 第5步：项目特定检查

检查 `CLAUDE.md` 中的：

```bash
grep -A5 "## Review checklist" CLAUDE.md
```

运行项目特定违规检查。

## 第6步：生成审查评论

对于每个问题：

- **问题：** [引用两行代码]
- **严重性：** P0（阻止） / P1（修复前） / P2（优化）
- **为什么：** [一句解释]
- **修复：** [建议代码]

## 第7步：输出格式

将审查格式化为GitHub PR注释：

```markdown
## 🔍 代码审查

### 🚨 关键问题 (P0 — 阻止)
[问题列表]

### ⚠️  重要问题 (P1 — 修复前)
[问题列表]

### 💡 建议 (P2 — 优化)
[问题列表]

### ✅ 亮点
[好点列表]

### 📊 统计
- 文件改变：N
- 插入：+N
- 删除：-N
- 覆盖：N%
```

## 检查清单

使用以下清单：

- [ ] SQL：没有注入
- [ ] 生成：输入已清理/转义
- [ ] 竞态：有原子操作/锁
- [ ] 权限：每个守护操作检查完整
- [ ] 测试：新代码有测试
- [ ] 类型：没有缺少的类型
- [ ] 错误处理：异常处理
- [ ] 性能：没有明显的O(n²)
- [ ] 死代码：无未使用的导入
- [ ] 文档：复杂代码有doc
