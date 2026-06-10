// AI API 余额桌面小组件 —— 多 API 组合版
// 支持 DeepSeek / OpenRouter / SiliconFlow
// 一个小组件可同时展示多个平台的余额
//
// Widget 参数格式（大小写不敏感）：
//   "all" / 空 → 显示所有已配置密钥的 API
//   "deepseek" / "1"          → 只显示 DeepSeek
//   "openrouter" / "2"        → 只显示 OpenRouter
//   "siliconflow" / "5"       → 只显示 SiliconFlow
//   "deepseek,openrouter"     → 显示 DeepSeek + OpenRouter
//   "openrouter,siliconflow"  → 显示 OpenRouter + SiliconFlow
//   数字兼容: 1=DeepSeek, 2=OpenRouter, 5=SiliconFlow

import {
  Image,
  Button,
  VStack,
  HStack,
  Text,
  fetch,
  Widget,
  SVG,
  Path,
  Script,
  Navigation,
} from "scripting"

import {
  STORAGE_OPTIONS,
  getApiConfig,
  parseWidgetParam,
  DEEPSEEK_API_CONFIG,
  SILICONFLOW_API_CONFIG,
  AIApiConfig,
  USER_ACTIVE_APIS,
  getCurrencySymbol,
  classifyError,
  getBalanceLevel,
  getBalanceColor,
} from "./constants"
import { MyIntent, RefreshIntent } from "./app_intents"

// ─── API 余额数据接口 ─────────────────────────────────────

interface BalanceInfo {
  apiId: string
  apiName: string
  amount: number
  currency: string
  limit?: number
  usage?: number
  limitRemaining?: number
  isFreeTier?: boolean
  error?: string
  lastUpdated: Date | null
}

// ─── 余额解析函数 ──────────────────────────────────────────

function parseDeepSeekBalance(data: any): BalanceInfo | null {
  if (!data?.balance_infos || !Array.isArray(data.balance_infos) || data.balance_infos.length === 0) {
    return null
  }
  const mainBalance = data.balance_infos[0]
  if (!mainBalance || typeof mainBalance.total_balance === "undefined") return null

  const amount = typeof mainBalance.total_balance === "number"
    ? mainBalance.total_balance
    : parseFloat(mainBalance.total_balance) || 0

  return {
    apiId: DEEPSEEK_API_CONFIG.id,
    apiName: DEEPSEEK_API_CONFIG.displayName,
    amount,
    currency: getCurrencySymbol(mainBalance.currency || "CNY"),
    lastUpdated: new Date(),
  }
}

function parseOpenRouterBalance(data: any): BalanceInfo | null {
  if (!data?.data) return null
  const apiData = data.data
  const limit = apiData.total_credits || 0
  const usage = apiData.total_usage || 0
  const limitRemaining = apiData.limit_remaining || limit - usage
  const isFreeTier = apiData.is_free_tier || false

  return {
    apiId: "openrouter",
    apiName: "OpenRouter",
    amount: limitRemaining,
    currency: getCurrencySymbol("USD"),
    limit,
    usage,
    limitRemaining,
    isFreeTier,
    lastUpdated: new Date(),
  }
}

function parseSiliconFlowBalance(data: any): BalanceInfo | null {
  if (!data?.data) {
    return {
      apiId: SILICONFLOW_API_CONFIG.id,
      apiName: SILICONFLOW_API_CONFIG.displayName,
      amount: 0,
      currency: '¥',
      error: data?.message || 'API返回数据格式错误',
      lastUpdated: new Date(),
    }
  }
  const balance = data.data?.balance ?? 0
  const totalBalance = data.data?.totalBalance ?? 0
  const usedBalance = totalBalance > 0 ? totalBalance - balance : 0

  return {
    apiId: SILICONFLOW_API_CONFIG.id,
    apiName: SILICONFLOW_API_CONFIG.displayName,
    amount: balance,
    currency: '¥',
    limit: totalBalance,
    usage: usedBalance,
    limitRemaining: balance,
    lastUpdated: new Date(),
  }
}

// ─── 查询单 API 余额 ──────────────────────────────────────

async function fetchApiBalance(apiConfig: AIApiConfig, apiKey: string): Promise<BalanceInfo | null> {
  try {
    const response = await fetch(apiConfig.apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30,
    })

    if (response.ok) {
      const data = await response.json()
      switch (apiConfig.id) {
        case "deepseek": return parseDeepSeekBalance(data)
        case "openrouter": return parseOpenRouterBalance(data)
        case "siliconflow": return parseSiliconFlowBalance(data)
        default: return null
      }
    } else {
      let errorText = ""
      try { errorText = await response.text() } catch {}
      return {
        apiId: apiConfig.id,
        apiName: apiConfig.displayName,
        amount: 0,
        currency: apiConfig.currency,
        error: `API错误: ${response.status}`,
        lastUpdated: new Date(),
      }
    }
  } catch (err) {
    return {
      apiId: apiConfig.id,
      apiName: apiConfig.displayName,
      amount: 0,
      currency: apiConfig.currency,
      error: err instanceof Error ? `网络错误: ${err.message}` : "未知网络错误",
      lastUpdated: null,
    }
  }
}

// ─── 格式化时间 ─────────────────────────────────────────────

function formatTime(date: Date | null): string {
  if (!date) return "从未更新"
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "刚刚"
  if (diffMin < 60) return `${diffMin}分钟前`

  return date.toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── 余额显示格式 ──────────────────────────────────────────

function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── 单 API 余额行组件（紧凑模式） ─────────────────────────

function BalanceRow({
  balance,
  config,
}: {
  balance: BalanceInfo | null
  config: AIApiConfig
}) {
  const svgPath = config?.logoSvgPath
  const logoHeight = config?.logoHeight || 18
  const logoPadding = config?.logoPadding ?? 6
  const overrideColor = config?.overrideColor ?? false
  const colorType = typeof overrideColor

  return (
    <HStack spacing={6} alignment="center" padding={0}>
      {/* Logo */}
      {svgPath ? (
        <SVG
          filePath={Path.join(Script.directory, svgPath)}
          scaleToFit
          resizable
          frame={{ height: logoHeight }}
          renderingMode={overrideColor ? "template" : 'original'}
          antialiased={true}
          padding={{ top: logoPadding }}
          foregroundStyle={colorType === 'string' ? overrideColor : undefined}
        />
      ) : null}

      {/* 余额或错误 */}
      {!balance ? (
        <Text font="caption" foregroundStyle="systemGray3">加载中...</Text>
      ) : balance.error ? (
        <Text font="caption" foregroundStyle="systemRed" multilineTextAlignment="leading">
          {classifyError(null, balance.error).message.length > 20
            ? classifyError(null, balance.error).message.substring(0, 20) + '…'
            : classifyError(null, balance.error).message}
        </Text>
      ) : (
        <HStack spacing={3} alignment="firstTextBaseline">
          <Text
            font="headline"
            foregroundStyle={getBalanceColor(getBalanceLevel(balance.amount))}
          >
            {balance.currency}{formatAmount(balance.amount)}
          </Text>
          {balance.limit !== undefined && balance.limit > 0 && (
            <Text font="caption2" foregroundStyle="systemGray3">
              / {balance.currency}{formatAmount(balance.limit)}
            </Text>
          )}
        </HStack>
      )}
    </HStack>
  )
}

// ─── 货币代码 → 显示名称对照 ─────────────────────────────

function currencyLabel(code: string): string {
  const map: Record<string, string> = {
    '$': 'USD', '¥': 'CNY', '€': 'EUR', '£': 'GBP',
    '₩': 'KRW', '₽': 'RUB', '₹': 'INR',
  }
  return map[code] || code
}

// ─── 多 API 组合小组件 ────────────────────────────────────

function MultiBalanceWidget({
  balances,
  lastRefresh,
}: {
  balances: Record<string, BalanceInfo | null>
  lastRefresh: Date | null
}) {
  const activeConfigs = USER_ACTIVE_APIS

  return (
    <VStack spacing={6} padding={0}>
      {/* 标题行 + 刷新按钮 */}
      <HStack spacing={6} alignment="center">
        <Text font="caption" foregroundStyle="systemGray2">API 余额</Text>
        <Button buttonStyle="plain" intent={MyIntent(0)}>
          <Image systemName="arrow.clockwise" font="caption" />
        </Button>
      </HStack>

      {/* 每 API 一行 */}
      {activeConfigs.map(config => (
        <BalanceRow
          key={config.id}
          balance={balances[config.id] ?? null}
          config={config}
        />
      ))}

      {/* 更新时间 */}
      {lastRefresh && (
        <Text font="caption2" foregroundStyle="systemGray3">
          {formatTime(lastRefresh)}
        </Text>
      )}
    </VStack>
  )
}

// ─── 单 API 小组件 ────────────────────────────────────────

function SingleBalanceWidget({
  balance,
  config,
  lastRefresh,
}: {
  balance: BalanceInfo | null
  config: AIApiConfig
  lastRefresh: Date | null
}) {
  const svgPath = config?.logoSvgPath
  const logoHeight = config?.logoHeight || 18
  const logoPadding = config?.logoPadding ?? 6
  const overrideColor = config?.overrideColor ?? false
  const colorType = typeof overrideColor

  return (
    <VStack spacing={8} padding={0} alignment="center">
      {/* 标题行 */}
      <HStack spacing={6} alignment="center">
        {svgPath ? (
          <SVG
            filePath={Path.join(Script.directory, svgPath)}
            scaleToFit
            resizable
            frame={{ height: logoHeight }}
            renderingMode={overrideColor ? "template" : 'original'}
            antialiased={true}
            padding={{ top: logoPadding }}
            foregroundStyle={colorType === 'string' ? overrideColor : undefined}
          />
        ) : null}
        <Button buttonStyle="plain" intent={RefreshIntent()}>
          <Image systemName="arrow.clockwise" />
        </Button>
      </HStack>

      {/* 余额或错误 */}
      {!balance ? (
        <Text font="body" foregroundStyle="systemGray3">加载中...</Text>
      ) : balance.error ? (
        <VStack spacing={4} alignment="center">
          <Image systemName={classifyError(null, balance.error).icon} font="body" foregroundStyle="systemRed" />
          <Text font="caption" foregroundStyle="systemRed" multilineTextAlignment="center">
            {classifyError(null, balance.error).message}
          </Text>
        </VStack>
      ) : (
        <VStack spacing={4} alignment="center">
          <Text
            font="largeTitle"
            foregroundStyle={getBalanceColor(getBalanceLevel(balance.amount))}
          >
            {balance.currency}{formatAmount(balance.amount)}
          </Text>
          <Text font="caption2" foregroundStyle="systemGray2">
            {currencyLabel(balance.currency)}
          </Text>
          {balance.isFreeTier && (
            <Text font="caption" foregroundStyle="systemGreen">免费套餐</Text>
          )}
          {balance.limit !== undefined && balance.limit > 0 && (
            <Text font="caption2" foregroundStyle="systemGray3">
              总额: {balance.currency}{formatAmount(balance.limit)}
            </Text>
          )}
          {lastRefresh && (
            <Text font="caption2" foregroundStyle="systemGray3">
              {formatTime(lastRefresh)}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  )
}

// ─── 小组件入口 ───────────────────────────────────────────

async function runAsWidget() {
  const lastRefresh = new Date()
  const param = Widget.parameter
  const targetIds = parseWidgetParam(param)

  // 空参数 → 组合模式（显示所有活跃 API）
  const isMultiMode = targetIds.length === 0

  if (isMultiMode) {
    const balances: Record<string, BalanceInfo | null> = {}

    for (const config of USER_ACTIVE_APIS) {
      try {
        const apiKey = Storage.get<string>(config.storageKey, STORAGE_OPTIONS)
        if (apiKey) {
          balances[config.id] = await fetchApiBalance(config, apiKey)
        } else {
          balances[config.id] = {
            apiId: config.id,
            apiName: config.displayName,
            amount: 0,
            currency: config.currency,
            error: "未设置密钥",
            lastUpdated: null,
          }
        }
      } catch {
        balances[config.id] = {
          apiId: config.id,
          apiName: config.displayName,
          amount: 0,
          currency: config.currency,
          error: "读取密钥失败",
          lastUpdated: null,
        }
      }
    }

    Widget.present(
      <MultiBalanceWidget balances={balances} lastRefresh={lastRefresh} />,
      { policy: "after", date: new Date(Date.now() + 5 * 60 * 1000) }
    )
    return
  }

  // 单 API 模式
  const targetId = targetIds[0]
  const config = getApiConfig(targetId)
  if (!config) {
    Widget.present(
      <VStack spacing={6} padding={0} alignment="center">
        <Image systemName="questionmark.circle" font="largeTitle" foregroundStyle="systemOrange" />
        <Text font="body" foregroundStyle="systemGray">未找到 API 配置</Text>
        <Text font="caption2" foregroundStyle="systemGray3">
          可用参数: {USER_ACTIVE_APIS.map(a => a.id).join(', ')}
        </Text>
      </VStack>,
      { policy: "after", date: new Date(Date.now() + 30 * 60 * 1000) }
    )
    return
  }

  let balance: BalanceInfo | null = null
  try {
    const apiKey = Storage.get<string>(config.storageKey, STORAGE_OPTIONS)
    if (apiKey) {
      balance = await fetchApiBalance(config, apiKey)
    } else {
      balance = {
        apiId: config.id,
        apiName: config.displayName,
        amount: 0,
        currency: config.currency,
        error: "未设置密钥",
        lastUpdated: null,
      }
    }
  } catch {
    balance = {
      apiId: config.id,
      apiName: config.displayName,
      amount: 0,
      currency: config.currency,
      error: "读取密钥失败",
      lastUpdated: null,
    }
  }

  Widget.present(
    <SingleBalanceWidget balance={balance} config={config} lastRefresh={lastRefresh} />,
    { policy: "after", date: new Date(Date.now() + 5 * 60 * 1000) }
  )
}

// ─── 统一入口 ─────────────────────────────────────────────

(async () => {
  await runAsWidget()
})().catch((e) => {
  Widget.present(
    <Text font="body" foregroundStyle="systemRed">{String(e)}</Text>
  )
})

export {}
