# AI API Balance Widget — 多 API 余额小组件

基于 [Dlian-Zero/api-balance](https://github.com/Dlian-Zero/api-balance) 优化改进。

一个 iOS Scripting 应用的桌面小组件，在 iPhone 桌面上直接查看 DeepSeek、OpenRouter、硅基流动的 API 余额。

## 🆕 改进亮点

| 优化项 | 说明 |
|-------|------|
| **多 API 组合模式** | 一个小组件同时显示所有平台的余额，无需摆放多个小组件 |
| **灵活的参数选择** | 支持名称/数字/逗号分隔三种参数格式，想显示什么组合都行 |
| **余额阈值颜色** | ≥ 50 绿色 🟢、10~50 橙色 🟠、< 10 红色 🔴，一眼知余额 |
| **智能错误分类** | 密钥无效(401) / 频率限制(429) / 网络中断，精确提示对应解决方案 |
| **更新时间显示** | 显示"刚刚"/"5分钟前"等相对时间，数据新鲜度一目了然 |
| **多币种支持** | 自动识别并显示 USD/CNY/EUR/GBP 等 12 种货币符号 |

## 支持的 API

| API | 参数（名称） | 参数（数字） | 货币 |
|-----|------------|------------|------|
| DeepSeek | `deepseek` | `1` | 人民币 ¥（默认） |
| OpenRouter | `openrouter` | `2` | 美元 $ |
| SiliconFlow | `siliconflow` | `5` | 人民币 ¥ |

## 小组件参数用法

在 iOS 桌面上添加 Scripting 小组件后，在"参数"栏填入：

| 参数值 | 效果 | 示例 |
|-------|------|------|
| 留空 / `all` | 显示所有已配置密钥的 API | ★ 最推荐 |
| `deepseek` | 只显示 DeepSeek | |
| `openrouter` | 只显示 OpenRouter | |
| `siliconflow` | 只显示 SiliconFlow | |
| `deepseek,openrouter` | 组合 DeepSeek + OpenRouter | 只看你想看的 |
| `1` | 兼容旧版：只显示 DeepSeek | |
| `2,5` | 兼容旧版：显示 OpenRouter + SiliconFlow | |

## 余额颜色规则

| 余额 | 颜色 | 状态 |
|------|------|------|
| ≥ 50 | 🟢 Green | 充足 |
| ≥ 10 | 🟠 Orange | 偏低 |
| < 10 | 🔴 Red | 不足 |

## 多币种支持

DeepSeek、OpenRouter、SiliconFlow 各自使用不同的货币：

| 货币 | 符号 | 适用 API |
|------|------|---------|
| 美元 (USD) | `$` | OpenRouter |
| 人民币 (CNY) | `¥` | DeepSeek（默认）、SiliconFlow |
| 欧元 (EUR) | `€` | DeepSeek（如 API 返回） |
| 英镑 (GBP) | `£` | DeepSeek（如 API 返回） |

## ⚠️ 重要：安装步骤（请仔细阅读）

### 第 1 步：安装 Scripting 应用
从 App Store 下载 **Scripting**（不是 Scriptable，注意区分）

[Scripting on App Store](https://apps.apple.com/app/scripting/id9116223691)

### 第 2 步：下载正确的文件

去 GitHub 仓库下载 **`api-balance.scripting`** 这个文件（不是点"Code → Download ZIP"）：

> https://github.com/zhengyifei200112-collab/api-balance

打开仓库后，在文件列表中找到 **`api-balance.scripting`** → 点击它 → 点击 **Download** 按钮（或 Raw 按钮）

### 第 3 步：导入 Scripting

1. 下载完成后，点击该文件
2. 在弹出的菜单中选择 **「用 Scripting 打开」**
在 Scripting 中你会看到这样的文件列表：
```
api-balance/
├── main.tsx              ← ⭐ **小组件入口**（自动运行）
├── index.tsx             ← 🔧 **设置页面**（配置密钥用）
├── constants.ts
├── app_intents.tsx
└── icons/
```

### 第 4 步：配置 API 密钥

1. 在 Scripting 中点击 **`index.tsx`** 运行设置页面
2. 分别设置 DeepSeek、OpenRouter、SiliconFlow 的 API Key
3. 密钥保存在 iPhone 私有存储中，安全可靠

### 第 5 步：添加桌面小组件

1. 回到 iPhone 桌面 → 长按空白处 → 点击左上角 **+** 号
2. 搜索 **「Scripting」** → 选择一个合适大小的小组件 → 点击「添加小组件」
3. ⭐ 长按桌面上刚添加的小组件 → 选择 **「编辑小组件」**
4. 点击 **「脚本」** 选项 → 选择 **「api-balance」**（现在不需要再点进去了）
5. **「参数」** 栏：留空（显示全部三个 API 余额）或按参数表填写
6. 点击桌面空白处完成 ✅

### 第 6 步：首次查看

小组件会显示：

```
API 余额      🔄
DeepSeek     ¥88.00
OpenRouter   $12.34
SiliconFlow  ¥56.23
刚刚
```

如果显示红色错误，按照提示去设置页面更新对应的 API Key。

---

## ❓ 常见问题

| 问题 | 解决方法 |
|------|---------|
| 小组件显示空白 | 检查是否选了 `widget.tsx`（不是 `index.tsx`） |
| 显示"未设置密钥" | 去 `index.tsx` 设置页面填入对应的 API Key |
| 显示红色错误 | 长按小组件 → 点刷新按钮 |
| 余额没变化 | iOS 限制小组件刷新频率，等几分钟或点刷新 |
| 想只看某些 API | 参数栏填 `deepseek,openrouter` 等组合 |

## 获取 API 密钥

| 平台 | 获取地址 |
|------|---------|
| DeepSeek | https://platform.deepseek.com |
| OpenRouter | https://openrouter.ai/keys |
| 硅基流动 | https://siliconflow.cn/ |
