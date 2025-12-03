import fs from 'fs'
import path from 'path'
import util from 'util'
import {log} from "wechaty";

/**
 * 从 msg 中提取可读文本（优先 text()，其次 String(msg)）
 * @param {import('wechaty').Message} msg
 * @returns {string}
 */
export function extractTextFromMsg(msg) {
  try {
    const t = msg.text && msg.text()
    if (t) return t
  }
  catch (e) {
    log.error(e)
    return ''
  }
}

/**
 * 如果文本中包含 http(s) 链接则保存到 <botName>-links.txt
 * 返回匹配到的 url 或 null
 */
export function saveLinkIfAny(text, contactName, botName) {
  const urlMatch = (text || '').match(/https?:\/\/[^\s'"]+/)
  if (urlMatch) {
    const url = urlMatch[0]
    const linksFile = path.resolve(process.cwd(), `${botName}-links.txt`)
    try {
      fs.appendFileSync(linksFile, `${new Date().toISOString()} ${contactName}: ${url}\n`)
      console.log(`已检测到链接并保存：${url} -> ${linksFile}`)
    } catch (e) {
      console.error('保存链接失败：', e)
    }
    return url
  }
  return null
}

/**
 * 如果消息不是文本类型，将原始 msg dump 到文件（便于离线分析）
 * 需要传入 textTypeConst（例如 bot.Message.Type.Text）以判断
 */
export function saveRawIfNonText(msg, textTypeConst, botName) {
  try {
    if (msg.type && msg.type() !== textTypeConst) {
      const rawDump = util.inspect(msg, { depth: null, getters: true, showHidden: false })
      const rawFile = path.resolve(process.cwd(), `${botName}-raw-${msg.id || Date.now()}.log`)
      fs.appendFileSync(rawFile, `\n=== RAW MSG ${new Date().toISOString()} ===\n`)
      fs.appendFileSync(rawFile, rawDump + '\n')
      console.log('已保存原始消息调试信息：', rawFile)
      try {
        console.log('非文本消息载荷（payload）：', JSON.stringify(msg.payload || {}, null, 2))
      } catch (e) {
        console.log('无法序列化 payload')
      }
      return rawFile
    }
  } catch (e) {
    console.log('保存或打印原始消息时出错：', e)
  }
  return null
}

/**
 * 封装发送固定回复（统一处理错误与日志）
 */
export async function sendFixedReply(contact, fixedReply) {
  try {
    await contact.say(fixedReply)
  } catch (e) {
    console.error('发送回复失败：', e)
    throw e
  }
}


