// API 余额小组件 — 单文件版
import { Image, Button, VStack, HStack, Text, fetch, Widget, SVG, Path, Script, Navigation, Form, Section, SecureField, List, Spacer, useState, useEffect } from "scripting"
import { STORAGE_OPTIONS, getApiConfig, parseWidgetParam, DEEPSEEK_API_CONFIG, SILICONFLOW_API_CONFIG, AIApiConfig, USER_ACTIVE_APIS, getCurrencySymbol, classifyError, getBalanceLevel, getBalanceColor } from "./constants"
import { MyIntent, RefreshIntent } from "./app_intents"

interface BalanceInfo { apiId: string; apiName: string; amount: number; currency: string; limit?: number; usage?: number; limitRemaining?: number; isFreeTier?: boolean; error?: string; lastUpdated: Date | null }

function parseDeepSeekBalance(data: any): BalanceInfo | null {
  if (!data?.balance_infos || !Array.isArray(data.balance_infos) || data.balance_infos.length === 0) return null
  const b = data.balance_infos[0]
  if (!b || typeof b.total_balance === "undefined") return null
  const amount = typeof b.total_balance === "number" ? b.total_balance : parseFloat(b.total_balance) || 0
  return { apiId: "deepseek", apiName: "DeepSeek", amount, currency: getCurrencySymbol(b.currency || "CNY"), lastUpdated: new Date() }
}

function parseOpenRouterBalance(data: any): BalanceInfo | null {
  if (!data?.data) return null
  const d = data.data; const limit = d.total_credits || 0; const usage = d.total_usage || 0
  return { apiId: "openrouter", apiName: "OpenRouter", amount: d.limit_remaining || limit - usage, currency: "$", limit, usage, limitRemaining: d.limit_remaining, isFreeTier: d.is_free_tier || false, lastUpdated: new Date() }
}

function parseSiliconFlowBalance(data: any): BalanceInfo | null {
  if (!data?.data) return { apiId: "siliconflow", apiName: "SiliconFlow", amount: 0, currency: "¥", error: data?.message || "数据格式错误", lastUpdated: new Date() }
  return { apiId: "siliconflow", apiName: "SiliconFlow", amount: data.data.balance ?? 0, currency: "¥", limit: data.data.totalBalance ?? 0, usage: (data.data.totalBalance ?? 0) - (data.data.balance ?? 0), limitRemaining: data.data.balance ?? 0, lastUpdated: new Date() }
}

async function fetchBalance(config: AIApiConfig, key: string): Promise<BalanceInfo | null> {
  try {
    const r = await fetch(config.apiUrl, { method: "GET", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, timeout: 30 })
    if (!r.ok) { let t=""; try{t=await r.text()}catch{}; return {apiId:config.id,apiName:config.displayName,amount:0,currency:config.currency,error:`API: ${r.status}`,lastUpdated:new Date()}}
    const d = await r.json()
    switch(config.id) {
      case "deepseek": return parseDeepSeekBalance(d)
      case "openrouter": return parseOpenRouterBalance(d)
      case "siliconflow": return parseSiliconFlowBalance(d)
      default: return null
    }
  } catch(e) { return {apiId:config.id,apiName:config.displayName,amount:0,currency:config.currency,error:e instanceof Error?e.message:"网络错误",lastUpdated:null} }
}

function fmtTime(d: Date|null): string {
  if(!d) return "从未"; const n=new Date(); const m=Math.floor((n.getTime()-d.getTime())/60000)
  if(m<1) return "刚刚"; if(m<60) return `${m}分钟前`
  return d.toLocaleString("zh-CN",{hour:"2-digit",minute:"2-digit"})
}

function BalanceRow({balance, config}: {balance: BalanceInfo|null, config: AIApiConfig}) {
  const svgPath=config?.logoSvgPath, logoH=config?.logoHeight||18, logoP=config?.logoPadding??6, oc=config?.overrideColor??false, ct=typeof oc
  return <HStack spacing={6} alignment="center" padding={0}>
    {svgPath ? <SVG filePath={Path.join(Script.directory, svgPath)} scaleToFit resizable frame={{height:logoH}} renderingMode={oc?"template":'original'} antialiased padding={{top:logoP}} foregroundStyle={ct==='string'?oc:undefined} /> : null}
    {!balance ? <Text font="caption" foregroundStyle="systemGray3">...</Text>
      : balance.error ? <Text font="caption" foregroundStyle="systemRed">{balance.error.length>18?balance.error.substring(0,18)+"…":balance.error}</Text>
      : <HStack spacing={3} alignment="firstTextBaseline">
          <Text font="headline" foregroundStyle={getBalanceColor(getBalanceLevel(balance.amount))}>{balance.currency}{balance.amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</Text>
          {balance.limit!==undefined&&balance.limit>0 ? <Text font="caption2" foregroundStyle="systemGray3">/ {balance.currency}{balance.limit.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</Text> : null}
        </HStack>}
  </HStack>
}

// Widget mode
if (Script.runsAsWidget) {
  (async()=>{
    const now=new Date(), ids=parseWidgetParam(Widget.parameter), isMulti=ids.length===0
    if(isMulti) {
      const bs: Record<string,BalanceInfo|null>={}
      for(const c of USER_ACTIVE_APIS) { try{const k=Storage.get<string>(c.storageKey,STORAGE_OPTIONS); bs[c.id]=k?await fetchBalance(c,k):{apiId:c.id,apiName:c.displayName,amount:0,currency:c.currency,error:"未设置",lastUpdated:null}}catch{bs[c.id]={apiId:c.id,apiName:c.displayName,amount:0,currency:c.currency,error:"读取失败",lastUpdated:null}} }
      Widget.present(<VStack spacing={6} padding={0}>
        <HStack spacing={6} alignment="center"><Text font="caption" foregroundStyle="systemGray2">API 余额</Text><Button buttonStyle="plain" intent={MyIntent(0)}><Image systemName="arrow.clockwise" font="caption"/></Button></HStack>
        {USER_ACTIVE_APIS.map(c=><BalanceRow key={c.id} balance={bs[c.id]??null} config={c}/>)}
        {now ? <Text font="caption2" foregroundStyle="systemGray3">{fmtTime(now)}</Text> : null}
      </VStack>,{policy:"after",date:new Date(Date.now()+5*60*1000)})
    } else {
      const c=getApiConfig(ids[0])
      if(!c) { Widget.present(<VStack spacing={6} padding={0} alignment="center"><Image systemName="questionmark.circle" font="largeTitle" foregroundStyle="systemOrange"/><Text font="body" foregroundStyle="systemGray">参数错误</Text></VStack>,{policy:"after",date:new Date(Date.now()+30*60*1000)}); return }
      let b:BalanceInfo|null=null
      try{const k=Storage.get<string>(c.storageKey,STORAGE_OPTIONS); b=k?await fetchBalance(c,k):{apiId:c.id,apiName:c.displayName,amount:0,currency:c.currency,error:"未设置密钥",lastUpdated:null}}catch{b={apiId:c.id,apiName:c.displayName,amount:0,currency:c.currency,error:"读取失败",lastUpdated:null}}
      Widget.present(<VStack spacing={8} padding={0} alignment="center">
        <HStack spacing={6} alignment="center">
          {c.logoSvgPath?<SVG filePath={Path.join(Script.directory,c.logoSvgPath)} scaleToFit resizable frame={{height:c.logoHeight||18}} renderingMode={(c.overrideColor??false)?"template":'original'} antialiased padding={{top:c.logoPadding??6}} foregroundStyle={typeof c.overrideColor==='string'?c.overrideColor:undefined}/>:null}
          <Button buttonStyle="plain" intent={RefreshIntent()}><Image systemName="arrow.clockwise"/></Button>
        </HStack>
        {!b?<Text font="body" foregroundStyle="systemGray3">加载中...</Text>:b.error?<VStack spacing={4} alignment="center"><Image systemName="exclamationmark.triangle" font="body" foregroundStyle="systemRed"/><Text font="caption" foregroundStyle="systemRed">{classifyError(null,b.error).message.length>30?classifyError(null,b.error).message.substring(0,30)+"…":classifyError(null,b.error).message}</Text></VStack>:<VStack spacing={4} alignment="center"><Text font="largeTitle" foregroundStyle={getBalanceColor(getBalanceLevel(b.amount))}>{b.currency}{b.amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</Text><Text font="caption2" foregroundStyle="systemGray2">{b.currency==="$"?"USD":"CNY"}</Text><Text font="caption2" foregroundStyle="systemGray3">{fmtTime(b.lastUpdated)}</Text></VStack>}
      </VStack>,{policy:"after",date:new Date(Date.now()+5*60*1000)})
    }
  })().catch(e=>Widget.present(<Text font="body" foregroundStyle="systemRed">{String(e)}</Text>))
}
