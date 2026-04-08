---
name: careful
version: 0.1.0
description: |
  破坏性命令的安全护栏。在rm -rf、DROP TABLE、
  force-push、git reset --hard、kubectl delete和类似的
  破坏性操作前警告。用户可以覆盖每个警告。在涉及prod、
  调试实时系统或在共享环境中工作时使用。当询问"小心"、
  "安全模式"、"prod模式"或"小心模式"时使用。(gstack)
allowed-tools:
  - Bash
  - Read
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash ${CLAUDE_SKILL_DIR}/bin/check-careful.sh"
          statusMessage: "检查破坏性命令..."
---

# /careful — 破坏性命令护栏

安全模式现在**活跃**。每个bash命令在运行前都会被检查
破坏命令。如发现破坏性命令，您会被警告
并可以选择继续或取消。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"careful","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 什么被保护

| 模式 | 示例 | 风险 |
|---------|---------|------|
| `rm -rf` / `rm -r` / `rm --recursive` | `rm -rf /var/data` | 递归删除 |
| `DROP TABLE` / `DROP DATABASE` | `DROP TABLE users;` | 数据丢失 |
| `TRUNCATE` | `TRUNCATE orders;` | 数据丢失 |
| `git push --force` / `-f` | `git push -f origin main` | 历史重写 |
| `git reset --hard` | `git reset --hard HEAD~3` | 未提交工作丢失 |
| `git checkout .` / `git restore .` | `git checkout .` | 未提交工作丢失 |
| `kubectl delete` | `kubectl delete pod` | 生产影响 |
| `docker rm -f` / `docker system prune` | `docker system prune -a` | 容器/镜像丢失 |

## 安全例外

这些模式允许不警告：
- `rm -rf node_modules` / `.next` / `dist` / `__pycache__` / `.cache` / `build` / `.turbo` / `coverage`

## 如何工作

hook从工具输入JSON读取命令，根据上面的模式检查它，
并如发现匹配，返回 `permissionDecision: "ask"` 带警告消息。
你总是可以覆盖警告并继续。

要停用，结束会话或开始新的。Hook是会话限制的。
