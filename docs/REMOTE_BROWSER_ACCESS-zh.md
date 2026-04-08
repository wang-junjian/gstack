# 远程浏览器访问 — 如何与 GStack 浏览器配对

GStack 浏览器服务器可以与任何能够进行 HTTP 请求的 AI 智能体共享。
智能体获得对真实 Chromium 浏览器的范围化访问：导航页面、读取内容、
点击元素、填充表单、获取屏幕截图。每个智能体获得自己的标签页。

本文档是远程智能体的参考。快速入门说明是
由 `$B pair-agent` 生成的，实际凭证已烘焙在内。

## 架构

```
您的机器                          遠程智能體
─────────────────────            ────────────
GStack 浏览器服务器               任何 AI 智能体
  ├── Chromium (Playwright)       (OpenClaw、Hermes、Codex 等)
  ├── HTTP API on localhost:PORT       │
  ├── ngrok 隧道（可选）              │
  │     https://xxx.ngrok.dev ─────────┘
  └── 令牌注册表
        ├── 根令牌（仅本地）
        ├── 设置密钥（5 分钟、一次性）
        └── 会话令牌（24 小时、范围）
```

## 连接流程

1. **用户运行** `$B pair-agent`（或 Claude Code 中的 `/pair-agent`）
2. **服务器创建** 一次性设置密钥（5 分钟过期）
3. **用户复制** 说明块到另一个智能体的聊天中
4. **远程智能体运行** `POST /connect` 及设置密钥
5. **服务器返回** 范围会话令牌（24 小时默认）
6. **远程智能体创建** 其自己的标签页 via `POST /command` with `newtab`
7. **远程智能体浏览** 使用 `POST /command` with 会话令牌 + tabId

## API 参考

### 认证

所有端点除 `/connect` 和 `/health` 外都需要 Bearer 令牌：

```
Authorization: Bearer gsk_sess_...
```

### 端点

#### POST /connect
用设置密钥交换会话令牌。不需要认证。速率限制为 3/分钟。

```json
请求：  {"setup_key": "gsk_setup_..."}
响应：  {"token": "gsk_sess_...", "expires": "ISO8601", "scopes": ["read","write"], "agent": "agent-name"}
```

#### POST /command
发送浏览器命令。需要 Bearer 认证。

```json
请求：  {"command": "goto", "args": ["https://example.com"], "tabId": 1}
响应：  (命令结果的纯文本)
```

#### GET /health
服务器状态。不需要认证。返回状态、标签页、模式、运行时间。

### 命令

#### 导航
| 命令 | 参数 | 描述 |
|------|------|------|
| `goto` | `["URL"]` | 导航到 URL |
| `back` | `[]` | 返回 |
| `forward` | `[]` | 前进 |
| `reload` | `[]` | 刷新页面 |

#### 读取内容
| 命令 | 参数 | 描述 |
|------|------|------|
| `snapshot` | `["-i"]` | 具有 @ref 标签的交互式快照（最有用）|
| `text` | `[]` | 完整页面文本 |
| `html` | `["selector?"]` | 元素或完整页面的 HTML |
| `links` | `[]` | 页面上的所有链接 |
| `screenshot` | `["/tmp/s.png"]` | 获取屏幕截图 |
| `url` | `[]` | 当前 URL |

#### 交互
| 命令 | 参数 | 描述 |
|------|------|------|
| `click` | `["@e3"]` | 点击元素（使用快照中的 @ref）|
| `fill` | `["@e5", "text"]` | 填充表单字段 |
| `select` | `["@e7", "option"]` | 选择下拉菜单值 |
| `type` | `["text"]` | 输入文本（键盘）|
| `press` | `["Enter"]` | 按键 |
| `scroll` | `["down"]` | 滚动页面 |

#### 标签页
| 命令 | 参数 | 描述 |
|------|------|------|
| `newtab` | `["URL?"]` | 创建新标签页（在写入前需要）|
| `tabs` | `[]` | 列出所有标签页 |
| `closetab` | `["id?"]` | 关闭标签页 |

## 快照 → @ref 模式

这是最强大的浏览模式。不用编写 CSS 选择器：

1. 运行 `snapshot -i` 获取带有标签元素的交互式快照
2. 快照返回文本，如：
   ```
   [页面标题]
   @e1 [link] "Home"
   @e2 [button] "Sign In"
   @e3 [input] "Search..."
   ```
3. 直接在命令中使用 `@e` 引用：`click @e2`，`fill @e3 "search query"`

这就是快照系统的工作方式，它比猜测 CSS 选择器要可靠得多。始终先 `snapshot -i`，然后使用 refs。

## 范围

| 范围 | 允许的 |
|------|--------|
| `read` | snapshot、text、html、links、screenshot、url、tabs、console 等 |
| `write` | goto、click、fill、scroll、newtab、closetab 等 |
| `admin` | eval、js、cookies、storage、cookie-import、useragent 等 |
| `meta` | tab、diff、frame、responsive、watch |

默认令牌获得 `read` + `write`。Admin 在配对时需要 `--admin` 标志。

## 标签页隔离

每个智能体拥有其创建的标签页。规则：
- **读取：** 任何智能体都可以读取任何标签页（snapshot、text、screenshot）
- **写入：** 仅标签页所有者可以写入（click、fill、goto 等）
- **无主标签页：** 预先存在的标签页仅根级写入
- **第一步：** 在尝试交互前始终 `newtab`

## 错误代码

| 代码 | 含义 | 怎么办 |
|------|------|--------|
| 401 | 令牌无效、过期或被撤销 | 要求用户再次运行 /pair-agent |
| 403 | 命令不在范围内，或标签页不是你的 | 使用 newtab，或请求 --admin |
| 429 | 速率限制超出（>10 req/s） | 等待 Retry-After 标头 |

## 安全模型

- 设置密钥在 5 分钟后过期，只能使用一次
- 会话令牌在 24 小时后过期（可配置）
- 根令牌从不出现在指令块或连接字符串中
- 默认拒绝 Admin 范围（JS 执行、cookie 访问）
- 令牌可以立即撤销：`$B tunnel revoke agent-name`
- 所有智能体活动都被记录，带有属性（clientId）

## 同机快捷方式

如果两个智能体都在同一台机器上，跳过复制粘贴：

```bash
$B pair-agent --local openclaw    # 写入 ~/.openclaw/skills/gstack/browse-remote.json
$B pair-agent --local codex       # 写入 ~/.codex/skills/gstack/browse-remote.json
$B pair-agent --local cursor      # 写入 ~/.cursor/skills/gstack/browse-remote.json
```

不需要隧道。直接使用本地主机。

## ngrok 隧道设置

对于远程机器上的远程智能体：

1. 在 [ngrok.com](https://ngrok.com) 上注册（免费层有效）
2. 从仪表板复制您的认证令牌
3. 保存它：`echo 'NGROK_AUTHTOKEN=your_token' > ~/.gstack/ngrok.env`
4. 可选择声明稳定域：`echo 'NGROK_DOMAIN=your-name.ngrok-free.dev' >> ~/.gstack/ngrok.env`
5. 使用隧道启动：`BROWSE_TUNNEL=1 $B restart`
6. 运行 `$B pair-agent` — 它将自动使用隧道 URL
