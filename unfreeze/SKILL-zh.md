---
name: unfreeze
preamble-tier: 1
version: 1.0.0
description: |
  移除由 /freeze 设置的目录编辑限制。清除冻结边界，允许再次编辑所有目录。
allowed-tools:
  - Bash
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## 前置步骤(首先运行)

```bash
_UPD=$(~/.claude/skills/gstack/bin/gstack-update-check 2>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2>/dev/null || true
_PROACTIVE=$(~/.claude/skills/gstack/bin/gstack-config get proactive 2>/dev/null || echo "true")
_PROACTIVE_PROMPTED=$([ -f ~/.gstack/.proactive-prompted ] && echo "yes" || echo "no")
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SKILL_PREFIX=$(~/.claude/skills/gstack/bin/gstack-config get skill_prefix 2>/dev/null || echo "false")
echo "PROACTIVE: $_PROACTIVE"
echo "PROACTIVE_PROMPTED: $_PROACTIVE_PROMPTED"
echo "SKILL_PREFIX: $_SKILL_PREFIX"
source <(~/.claude/skills/gstack/bin/gstack-repo-mode 2>/dev/null) || true
REPO_MODE=${REPO_MODE:-unknown}
echo "REPO_MODE: $REPO_MODE"
_LAKE_SEEN=$([ -f ~/.gstack/.completeness-intro-seen ] && echo "yes" || echo "no")
echo "LAKE_INTRO: $_LAKE_SEEN"
_TEL=$(~/.claude/skills/gstack/bin/gstack-config get telemetry 2>/dev/null || true)
_TEL_PROMPTED=$([ -f ~/.gstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo "TELEMETRY: ${_TEL:-off}"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"unfreeze","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
```

# /unfreeze — 清除冻结边界

您正在清除冻结边界。这将删除 `/freeze` 设置的任何目录限制。

## 用户可调用
当用户输入 `/unfreeze` 时运行此技能。

## 说明

### 第 1 步：检查是否存在冻结

```bash
if [ -f ~/.gstack/.frozen ]; then
  _FROZEN=$(cat ~/.gstack/.frozen)
  echo "FROZEN_DIR: $_FROZEN"
else
  echo "FROZEN_DIR: none"
fi
```

如果没有冻结目录，停止并通知用户："没有冻结边界要清除。"

### 第 2 步：清除冻结

```bash
rm -f ~/.gstack/.frozen
echo "✓ 冻结边界已清除"
```

### 第 3 步：确认

```bash
if [ ! -f ~/.gstack/.frozen ]; then
  echo "✓ 所有目录现在对编辑开放"
else
  echo "✗ 冻结清除失败"
fi
```

## 说明

- 使用这个当 `/freeze` 不再相关时——例如，完成危险操作后
- `/unfreeze` 是对称的 `/freeze` — 它删除限制而不是添加限制
- 您无法在当前冻结的目录中运行 `/unfreeze` — `/freeze` 不允许那样的编辑
- 要解冻，让用户在 shell 中手动运行它，或来自不同的编辑位置

## 下一步

- 使用 `/freeze` 再次设置新边界
- 编辑您想要的任何目录
