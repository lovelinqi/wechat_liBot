import { WechatyBuilder, ScanStatus } from 'wechaty'
import qrTerminal from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { extractTextFromMsg, saveLinkIfAny, saveRawIfNonText, sendFixedReply } from './messageService.js'

const DEFAULT_REPLY = '这是自动回复：我现在有事，稍后回复你。'

function getEnvOrDefault(name, fallback) {
  return process.env[name] && process.env[name].length ? process.env[name] : fallback
}

export async function startBot() {
  const puppet = getEnvOrDefault('PUPPET', 'wechaty-puppet-wechat4u')
  const chromeBin = getEnvOrDefault('CHROME_BIN', '')
  const botName = getEnvOrDefault('BOT_NAME', 'WechatLiBot')
  const fixedReply = getEnvOrDefault('FIXED_REPLY', DEFAULT_REPLY)

  const CHROME_BIN = chromeBin ? { endpoint: chromeBin } : {}

  // 确保 memory-card 文件与当前工作目录同级持久化（可选）
  const memoryCardFile = path.resolve(process.cwd(), `${botName}.memory-card.json`)
  // 说明：当使用 name 字段时，Wechaty 会自动创建/读取 memory-card

  // 使用指定的 puppet 和选项构建 Wechaty 实例
  const bot = WechatyBuilder.build({
    name: botName,
    puppet,
    puppetOptions: {
      uos: true,
      ...CHROME_BIN,
    },
  })

  // 二维码处理函数 - 在控制台输出二维码供扫码登录
  function onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      qrTerminal.generate(qrcode, { small: true })
      const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
      console.log('扫码二维码链接：', qrcodeImageUrl, ScanStatus[status], status)
    } else {
      console.log('扫码状态：', ScanStatus[status], status)
    }
  }

  /************************** 登录处理函数 **************************/
  function onLogin(user) {
    console.log(`${user} 已登录 - memory-card 文件：${memoryCardFile}`)
  }

  // 登出处理函数
  function onLogout(user) {
    console.log(`${user} 已登出`)
  }

  /************************** 错误处理函数 **************************/
  bot.on('error', (e) => {
    console.error('机器人发生错误：', e)
  })

  /************************** 消息处理函数 **************************/
  bot.on('message', async (msg) => {
    try {
      console.log("----------------------------- msg -----------------------------")
      console.log("msg", msg)
      const talker = msg.talker()
      console.log("----------------------------- talker -----------------------------")
      console.log("talker", talker)
      // 忽略自己发送的消息或系统消息
      if (talker.self()) return

      const room = msg.room()
      // 仅响应私聊（好友）消息；忽略群消息
      if (room) return

      const contact = talker

      // 提取文本并记录到日志（若无文本则为 ''）
      const text = extractTextFromMsg(msg)
      console.log(`收到来自 ${contact.name()} 的消息（类型 ${msg.type()}）：${text || '[无文本]'}`)

      // // 按类别处理：链接、非文本原始保存、其它
      // const foundUrl = saveLinkIfAny(text, contact.name(), botName)
      // if (!foundUrl) {
      //   // msg.type 的文本类型由 bot 提供的常量比较，因此传入该常量以便复用
      //   saveRawIfNonText(msg, bot.Message.Type.Text, botName)
      // }

      // 发送固定回复（统一封装）
      await sendFixedReply(contact, fixedReply)
      console.log(`已回复 ${contact.name()}`)
    } catch (err) {
      console.error('消息处理出错：', err)
    }
  })

  // 注册生命周期回调
  bot.on('scan', onScan)
  bot.on('login', onLogin)
  bot.on('logout', onLogout)

  // 启动机器人
  try {
    await bot.start()
    console.log('wechat_liBot 已启动，等待好友消息...')
    } catch (e) {
    console.error('启动机器人失败：', e)
    throw e
  }
}


