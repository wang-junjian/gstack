# TODOS.md 格式参考

gstack项目中规范TODOS.md的形式的共享参考。由 `/ship`（第5.5步）和 `/plan-ceo-review`（TODOS.md更新部分）引用，确保TODO项目结构的一致性。

---

## 文件结构

```markdown
# TODOS

## <技能/组件>     ← 例如，## Browse、## Ship、## Review、## Infrastructure
<按P0排序的项目，然后P1、P2、P3、P4>

## Completed
<完成的项目及其完成标注>
```

**部分：**按技能或组件组织（`## Browse`、`## Ship`、`## Review`、`## QA`、`## Retro`、`## Infrastructure`）。在每个部分内，按优先级排序项目（P0在顶部）。

---

## TODO项目格式

每个项目是其部分下的H3：

```markdown
### <标题>

**What:** 工作的一行描述。

**Why:** 它解决的具体问题或它释放的价值。

**Context:** 足够的细节，使得3个月后有人接手时理解动机、当前状态和从哪里开始。

**Effort:** S / M / L / XL
**Priority:** P0 / P1 / P2 / P3 / P4
**Depends on:** <先决条件，或"None">
```

**必需字段：** What、Why、Context、Effort、Priority
**可选字段：** Depends on、Blocked by

---

## 优先级定义

- **P0** — 阻塞：必须在下一个版本之前完成
- **P1** — 关键：应该在此周期完成
- **P2** — 重要：当P0/P1完成时进行
- **P3** — 不错：采用/使用数据后重新考虑
- **P4** — 有朝一日：好主意，没有紧迫性

---

## 完成项目格式

当项目完成时，将其移到 `## Completed` 部分，保留其原始内容并添加：

```markdown
**Completed:** vX.Y.Z (YYYY-MM-DD)
```
