---
name: pair-agent
version: 0.1.0
description: |
  将远程AI智能体与您的浏览器配对。一个命令生成设置密钥
  并打印其他智能体可以遵循的连接说明。与OpenClaw、
  Hermes、Codex、Cursor或任何可以发出HTTP请求的智能体一起工作。
  远程智能体获得自己的标签且访问受限（默认读+写，请求时为管理员）。
  当被问"配对智能体"、"连接智能体"、"共享浏览器"、
  "远程浏览器"、"让另一个智能体使用我的浏览器"或
  "给予浏览器访问权限"时使用。(gstack)
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion

---

# 配对智能体

与远程AI智能体安全地共享你的浏览器。一个命令
生成连接密钥和说明。

## 启动配对

```bash
# 启动配对服务器
/pair-agent

# 生成连接密钥
pair-key=$(gstack-pair-agent --generate-key)
echo "连接密钥：$pair-key"
```

## 什么是配对？

当你配对一个智能体时：

1. **你的浏览器保证可用** — 远程智能体可以导航、点击、读取页面内容
2. **受限的权限** — 默认读+写。管理员操作（删除数据、修改设置）需要你的approval
3. **自己的标签** — 远程智能体在自己的浏览器标签中做其工作
4. **实时可见性** — 你看到他们正在做什么，何时发生
5. **随时断开连接** — 一个命令，他们失去访问权限

## 使用情况

### 寻求帮助的远程智能体

```bash
# 远程智能体会收到这个说明
# 他们会运行：
gstack-pair-agent --connect <connection-key>
```

之后他们可以在你的浏览器中进行操作：

```bash
$B goto "https://example.com"
$B click "button.submit"
$B screenshot
```

### 你的一端

```bash
# 启动配对（打印连接密钥）
/pair-agent

# 查看连接的智能体
gstack-pair-agent --list-connections

# 显示活动源（他们正在做什么）
gstack-pair-agent --activity

# 批准管理员操作（他们请求什么？）
gstack-pair-agent --approve <connection-id>

# 断开一个智能体
gstack-pair-agent --disconnect <connection-id>

# 停止配对完全
gstack-pair-agent --stop
```

## 权限模型

**默认（读+写，快速）：**
- 导航到URL ✅
- 点击元素 ✅
- 输入表单 ✅
- 读取页面内容 ✅
- 获取屏幕截图 ✅
- 收集指标 ✅
- **删除数据** ❌ 需要你的approval
- **修改关键设置** ❌ 需要你的approval
- **访问安全信息** ❌ 需要你的approval

当远程智能体尝试受限操作时，会向你发送请求：

```
OpenClaw wants to DELETE /api/users?id=123
Do you want to:
  A) Allow this once
  B) Block this
  C) Ask me each time
```

## 连接密钥

```bash
# 生成临时密钥（1小时过期）
gstack-pair-agent --temp-key

# 生成持久密钥（需要显明撤销）
gstack-pair-agent --persistent-key

# 列出所有活动密钥
gstack-pair-agent --list-keys

# 撤销一个密钥
gstack-pair-agent --revoke-key <key>
```

## 与多个智能体配对

```bash
# 每个get own connection
key1=$(gstack-pair-agent --generate-key)
key2=$(gstack-pair-agent --generate-key)

# 智能体1连接
# 智能体2连接

# 他们共享同一浏览器，各自的标签
# 你可以单独控制每个
```

## 数据隐私

连接期间发送到远程智能体的内容：

- ✅ 页面HTML、文本、结构
- ✅ 点击位置、导航URL
- ✅ 屏幕截图（你看到的）
- ❌ 密码（从不发送）
- ❌ 隐藏的API密钥（本地过滤）
- ❌ 浏览器历史、Cookie（除非智能体明确读取）

## 会话日志

所有配对会话被记录到 `~/.gstack/pair-sessions/`
以供后续审计。

```bash
# 查看过去的会话
gstack-pair-agent --history

# 导出会话日志
gstack-pair-agent --export-session <session-id> > session.json
```

## 常见用例

**1. 不同智能体之间的协作**
- 你在claude-code中
- 你配对OpenClaw来做QA测试
- OpenClaw在你的浏览器中进行测试

**2. 特殊系统访问**
- 你没有对特定系统的访问权限
- 同事用他们的凭据启动配对
- 你可以与该系统交互（带审计日志）

**3. 远程调试**
- 用户报告一个你无法重现的bug
- 他们启动配对，给你连接密钥
- 你实时看到问题发生

## 故障排除

```bash
# 连接挂起？
gstack-pair-agent --test-connection <key>

# 性能缓慢？
gstack-pair-agent --set-latency high

# 需要重新连接？
gstack-pair-agent --reset <connection-id>
```
