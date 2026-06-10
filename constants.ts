// AI API 余额检查器 - 多API支持配置
// 支持DeepSeek、OpenRouter、SiliconFlow等AI API的余额查询

import { Color } from "scripting"

// ─── 存储选项 ──────────────────────────────────────────────

export const STORAGE_OPTIONS = { shared: false }
export const OLD_STORAGE_OPTIONS = { shared: true }

// ─── 余额阈值（用于颜色告警） ──────────────────────────────
// 金额单位：相应平台货币（USD / CNY）

export const BALANCE_THRESHOLDS = {
  HIGH: 50,              // ≥ $50/¥50 → 🟢 充足
  MEDIUM: 10,            // ≥ $10/¥10 → 🟡 偏低
  // < 10 → 🔴 不足
} as const

// ─── API 类型定义 ──────────────────────────────────────────

export interface AIApiConfig {
  id: string
  name: string
  displayName: string
  storageKey: string
  apiUrl: string
  consoleUrl: string
  keyPrefix?: string
  keyMinLength?: number
  logoSvgPath?: string
  logoHeight?: number
  logoPadding?: number
  overrideColor?: boolean | Color | string
  description: string
  currency: string           // 默认货币符号
}

// ─── DeepSeek ─────────────────────────────────────────────

export const DEEPSEEK_API_CONFIG: AIApiConfig = {
  id: 'deepseek',
  name: 'DeepSeek',
  displayName: 'DeepSeek',
  storageKey: 'deepseek_api_key',
  apiUrl: 'https://api.deepseek.com/user/balance',
  consoleUrl: 'https://platform.deepseek.com',
  keyPrefix: 'sk-',
  keyMinLength: 20,
  logoSvgPath: 'icons/DeepSeek.svg',
  overrideColor: '#4D6BFE',
  description: 'DeepSeek AI API密钥',
  currency: '¥',
}

// ─── OpenRouter ───────────────────────────────────────────

export const OPENROUTER_API_CONFIG: AIApiConfig = {
  id: 'openrouter',
  name: 'OpenRouter',
  displayName: 'OpenRouter',
  storageKey: 'openrouter_api_key',
  apiUrl: 'https://openrouter.ai/api/v1/credits',
  consoleUrl: 'https://openrouter.ai/keys',
  keyPrefix: 'sk-or-',
  logoSvgPath: 'icons/OpenRouter.svg',
  overrideColor: true,
  description: 'OpenRouter API密钥',
  currency: '$',
}

// ─── 硅基流动 (SiliconFlow) ───────────────────────────────

export const SILICONFLOW_API_CONFIG: AIApiConfig = {
  id: 'siliconflow',
  name: 'SiliconFlow',
  displayName: 'SiliconFlow',
  storageKey: 'siliconflow_api_key',
  apiUrl: 'https://api.siliconflow.cn/v1/user/info',
  consoleUrl: 'https://siliconflow.cn/',
  logoSvgPath: 'icons/SiliconFlow.svg',
  logoHeight: 18,
  logoPadding: 3,
  overrideColor: '#6e29f6',
  description: '硅基流动 API密钥',
  currency: '¥',
}

// ─── 阿里云（保留但不推荐给用户） ──────────────────────────

export const ALIYUN_API_CONFIG: AIApiConfig = {
  id: 'aliyun',
  name: '阿里云',
  displayName: '阿里云余额',
  storageKey: 'aliyun_api_credentials',
  apiUrl: 'https://business.aliyuncs.com',
  consoleUrl: 'https://ram.console.aliyun.com/users',
  logoSvgPath: 'icons/Aliyun.svg',
  logoHeight: 20,
  logoPadding: 3,
  description: '阿里云 AccessKey 凭据',
  currency: '¥',
}

// ─── MiniMax（保留但不推荐给用户） ─────────────────────────

export const MINIMAX_API_CONFIG: AIApiConfig = {
  id: 'minimax',
  name: 'MiniMax',
  displayName: 'MiniMax Token Plan',
  storageKey: 'minimax_api_key',
  apiUrl: 'https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains',
  consoleUrl: 'https://platform.minimaxi.com/',
  logoSvgPath: 'icons/MiniMax.svg',
  logoHeight: 18,
  logoPadding: 3,
  overrideColor: '#f84f4d',
  description: 'MiniMax API密钥（Token Plan 用量）',
  currency: '',
}

// ─── 完整 API 列表（所有支持） ─────────────────────────────

export const SUPPORTED_APIS: AIApiConfig[] = [
  DEEPSEEK_API_CONFIG,
  OPENROUTER_API_CONFIG,
  ALIYUN_API_CONFIG,
  MINIMAX_API_CONFIG,
  SILICONFLOW_API_CONFIG,
]

// ─── 用户常用 API 列表（DeepSeek + OpenRouter + SiliconFlow） ──

export const USER_ACTIVE_APIS: AIApiConfig[] = [
  DEEPSEEK_API_CONFIG,
  OPENROUTER_API_CONFIG,
  SILICONFLOW_API_CONFIG,
]

// ─── API ID ↔ 配置辅助函数 ─────────────────────────────────

export function getApiConfig(apiId: string): AIApiConfig | undefined {
  return SUPPORTED_APIS.find(api => api.id === apiId)
}

export function getAllStorageKeys(): string[] {
  return SUPPORTED_APIS.map(api => api.storageKey)
}

// ─── Widget 参数解析：支持多种参数格式 ────────────────────
//
// 格式示例（大小写不敏感）：
//   "all" / "" / 未设置 → 显示所有已配置密钥的 API
//   "deepseek" / "1"    → 只显示 DeepSeek
//   "openrouter" / "2"  → 只显示 OpenRouter
//   "siliconflow" / "5" → 只显示 SiliconFlow
//   "deepseek,openrouter" → 显示 DeepSeek + OpenRouter
//   "openrouter,siliconflow" → 显示 OpenRouter + SiliconFlow
//
// 数字兼容：1=DeepSeek, 2=OpenRouter, 3=阿里云, 4=MiniMax, 5=SiliconFlow

const PARAM_MAP_NUMBER: Record<string, string> = {
  '1': 'deepseek',
  '2': 'openrouter',
  '3': 'aliyun',
  '4': 'minimax',
  '5': 'siliconflow',
}

export function parseWidgetParam(param: string | null): string[] {
  if (!param) return [] // "all" mode

  const trimmed = param.trim().toLowerCase()
  if (!trimmed) return []

  // "all" → 全部
  if (trimmed === 'all') return []

  // 逗号分隔列表
  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
  const ids: string[] = []

  for (const part of parts) {
    // 数字兼容
    if (/^\d+$/.test(part)) {
      const mapped = PARAM_MAP_NUMBER[part]
      if (mapped) ids.push(mapped)
    } else {
      // 直接按 name/id 匹配
      const matched = SUPPORTED_APIS.find(
        a => a.id === part || a.name.toLowerCase() === part
      )
      if (matched) ids.push(matched.id)
    }
  }

  return [...new Set(ids)] // 去重
}

// ─── 获取货币符号 ──────────────────────────────────────────

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    CNY: "¥",
    RMB: "¥",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  }
  return symbols[currency] || currency
}

// ─── 余额颜色阈值辅助函数 ──────────────────────────────────

export type BalanceLevel = 'high' | 'medium' | 'low'

export function getBalanceLevel(amount: number): BalanceLevel {
  if (amount >= BALANCE_THRESHOLDS.HIGH) return 'high'
  if (amount >= BALANCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

export function getBalanceColor(level: BalanceLevel): string {
  switch (level) {
    case 'high': return 'systemGreen'
    case 'medium': return 'systemOrange'
    case 'low': return 'systemRed'
  }
}

// ─── 错误分类提示 ──────────────────────────────────────────

export interface ClassifiedError {
  icon: string
  message: string
}

export function classifyError(statusCode: number | null, rawMessage: string): ClassifiedError {
  if (statusCode === 401 || rawMessage.includes('401') || rawMessage.includes('Unauthorized') || rawMessage.includes('Invalid token')) {
    return { icon: 'key.fill', message: '密钥无效或已过期\n请更新 API Key' }
  }
  if (statusCode === 403 || rawMessage.includes('403')) {
    return { icon: 'lock.fill', message: '密钥无权限\n请检查 API 权限' }
  }
  if (statusCode === 429 || rawMessage.includes('429') || rawMessage.includes('rate limit')) {
    return { icon: 'clock.fill', message: '请求过于频繁\n请稍后刷新' }
  }
  if (statusCode === 503 || statusCode === 502 || rawMessage.includes('timeout') || rawMessage.includes('网络')) {
    return { icon: 'wifi.slash', message: '服务暂时不可用\n请检查网络连接' }
  }
  return { icon: 'exclamationmark.triangle', message: rawMessage.length > 40 ? rawMessage.substring(0, 40) + '...' : rawMessage }
}

// ─── 阿里云配置（原有，保持不变） ──────────────────────────

export const ALIYUN_API_VERSION = '2017-12-14'
export const ALIYUN_API_ACTION = 'QueryAccountBalance'
export const ALIYUN_SIGNATURE_METHOD = 'HMAC-SHA1'
export const ALIYUN_SIGNATURE_VERSION = '1.0'

export const ALIYUN_SUPPORTED_REGIONS = [
  { id: 'cn-hangzhou', name: '华东1（杭州）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-beijing', name: '华北2（北京）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-shanghai', name: '华东2（上海）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-shenzhen', name: '华南1（深圳）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-qingdao', name: '华北1（青岛）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-zhangjiakou', name: '华北3（张家口）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-huhehaote', name: '华北5（呼和浩特）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-wulanchabu', name: '华北6（乌兰察布）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-chengdu', name: '西南1（成都）', endpoint: 'business.aliyuncs.com' },
  { id: 'cn-hongkong', name: '中国（香港）', endpoint: 'business.aliyuncs.com' },
  { id: 'ap-southeast-1', name: '新加坡', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'ap-northeast-1', name: '日本（东京）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'ap-southeast-2', name: '澳大利亚（悉尼）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'ap-southeast-3', name: '马来西亚（吉隆坡）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'ap-southeast-5', name: '印度尼西亚（雅加达）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'ap-south-1', name: '印度（孟买）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'us-west-1', name: '美国（硅谷）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'us-east-1', name: '美国（弗吉尼亚）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'eu-west-1', name: '英国（伦敦）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'eu-central-1', name: '德国（法兰克福）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
  { id: 'me-east-1', name: '阿联酋（迪拜）', endpoint: 'business.ap-southeast-1.aliyuncs.com' },
]

export const ALIYUN_DEFAULT_REGION = 'cn-hangzhou'

export interface AliyunCredentials {
  accessKeyId: string
  accessKeySecret: string
  regionId: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'CNY': '¥',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'HKD': 'HK$',
  'SGD': 'S$',
  'AUD': 'A$',
  'CAD': 'C$',
  'KRW': '₩',
  'RUB': '₽',
  'INR': '₹',
}

export function getAliyunEndpointForRegion(regionId: string): string {
  const region = ALIYUN_SUPPORTED_REGIONS.find(r => r.id === regionId)
  return region ? `https://${region.endpoint}` : 'https://business.aliyuncs.com'
}

export function getAliyunRegionName(regionId: string): string {
  const region = ALIYUN_SUPPORTED_REGIONS.find(r => r.id === regionId)
  return region ? region.name : regionId
}
