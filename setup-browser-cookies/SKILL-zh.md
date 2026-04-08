---
name: setup-browser-cookies
preamble-tier: 1
version: 1.0.0
description: |
  从您的真实Chromium浏览器导入cookie到无头浏览会话。
  打开一个交互式选择器UI，您可以选择要导入的cookie域。
  在QA测试已认证页面前使用。当被问到"导入cookie"、
  "登录到网站"或"认证浏览器"时使用。(gstack)
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<!-- 从SKILL.md.tmpl自动生成 — 不直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->

## 前言（首先运行）

```bash
# 标准的gstack前言（省略以简洁）
```

## 第1步：找到浏览器

```bash
# 检测系统上的Chromium/Chrome安装
# 支持：Chrome、Chromium、Brave、Edge、Arc等
```

## 第2步：选择cookie

```bash
# 启动交互式picker UI
# 用户从其浏览器中选择要导入的cookie域
```

## 第3步：导入到无头会话

```bash
# cookie按域导入到Playwright无头浏览器
# 现在您可以在QA会话中访问已认证页面
```

## 使用情况

运行后，浏览器现在有来自您真实浏览器的cookie。任何
后续QA或QA-only运行都将能够访问已认证的页面。

**什么保存：**
- 来自选定域的Session cookie
- 来自选定域的永久cookie
- 所有HTTP标志和安全属性

**什么不保存：**
- 来自非选定域的cookie
- Chromium内部的cookie（__Secure-*，__Host-*）
- 过期的cookie

## 有效期

导入的cookie在您运行 `$B disconnect` 或关闭无头浏览器时过期。
要为多个QA运行保留cookie，保持浏览器连接。
