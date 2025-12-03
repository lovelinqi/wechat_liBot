# wechat_liBot

一个基于 Wechaty 的最小化个人机器人示例，监听好友（私聊）消息并回复固定文本。

本示例刻意不包含任何 AI 集成，仅演示与主项目相同的登录、接收和发送流程，方便验证消息链路。

使用方法
- 可选：在本目录创建 `.env` 文件，包含下述环境变量（也可以直接在环境中设置）
- 安装依赖：

```bash
npm install
```

- 启动程序：

```bash
npm start
```

环境变量说明
- `PUPPET`：要使用的 puppet 包名（默认 `wechaty-puppet-wechat4u`）
- `CHROME_BIN`：使用基于 puppeteer 的 puppet 时可选的 Chromium endpoint
- `BOT_NAME`：memory-card 文件与日志使用的名称（默认 `WechatLiBot`）
- `FIXED_REPLY`：收到好友消息时回复的固定文本（默认：`这是自动回复：我现在有事，稍后回复你。`）

注意事项
- 如果在容器中运行，请确保 `node_modules` 与生成的 memory-card（如 `WechatLiBot.memory-card.json`）在重启后能够持久化（例如挂载卷）。
- 本示例使用与主项目相同的 puppet，因此同样受限于会话持久化和账号风控的风险。生产环境建议优先使用企业微信（WeCom）等官方 API 以降低封号风险。

故障排除
### GitHub 推送失败：邮箱隐私保护问题

**问题现象：**
```
remote: error: GH007: Your push would publish a private email address.
remote: You can make your email public or disable this protection by visiting:
remote: https://github.com/settings/emails
! [remote rejected] main -> main (push declined due to email privacy restrictions)
```

**问题原因：**
GitHub 的邮箱隐私保护功能会阻止推送包含私人邮箱地址的提交，以保护用户隐私。当 Git 配置中使用个人邮箱（如 `username@outlook.com`）时，会触发此保护机制。

**解决方案：**
1. **更改 Git 邮箱为 GitHub 隐私保护邮箱：**
   ```bash
   git config user.email "YourUsername@users.noreply.github.com"
   ```
   将 `YourUsername` 替换为你的 GitHub 用户名。

2. **修改现有提交的作者信息：**
   ```bash
   git commit --amend --reset-author --no-edit
   ```

3. **强制推送修改后的提交：**
   ```bash
   git push -u origin main --force-with-lease
   ```

**其他可选解决方案：**
- 在 GitHub 设置中公开邮箱地址（访问 https://github.com/settings/emails）
- 在 GitHub 设置中关闭"Block command line pushes that expose my email"选项
