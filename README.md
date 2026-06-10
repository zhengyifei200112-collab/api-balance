# AI API Balance Widget — 多 API 余额小组件

> 基于 [Dlian-Zero/api-balance](https://github.com/Dlian-Zero/api-balance) 优化改进

一个 iOS **Scripting 应用**的桌面小组件，在 iPhone 桌面上直接查看 AI API 的账户余额。支持 DeepSeek、OpenRouter、硅基流动等平台。

---

## ✨ 优化内容（vs 原版）

| 优化项 | 原版 | 改进版 |
|-------|------|-------|
| **展示方式** | 每个小组件只能显示 **1 个 API** | **一个小组件同时显示多个 API** |
| **参数格式** | 仅支持数字 `1`~`5` | 支持名称(`deepseek`)、数字(`1`)、逗号组合(`deepseek,openrouter`)、`all`四种格式 |
| **余额颜色** | 仅红色/绿色两种 | **三档阈值颜色**：≥50 绿色 / ≥10 橙色 / <10 红色 |
| **错误提示** | 笼统的 "API 错误: 401" | **分类识别**：密钥无效 / 频率限制 / 网络中断，给出具体建议 |
| **更新时间** | 仅显示 "更新于 xx:xx" | **相对时间**：显示"刚刚""5分钟前""xx:xx" |
| **设置页面** | 仅基本使用说明 | **内置全部参数格式说明** + 颜色规则指引 |

---

## 📱 支持的 API

| API | 参数（名称） | 参数（数字） | 货币 |
|-----|------------|------------|------|
| DeepSeek | `deepseek` | `1` | USD |
| OpenRouter | `openrouter` | `2` | USD |
| 硅基流动 (SiliconFlow) | `siliconflow` | `5` | CNY |

---

## 🔧 小组件参数用法

在 iOS 桌面上添加 Scripting 小组件后，在「参数」栏填写：

| 参数值 | 效果 |
|-------|------|
| **（留空）** | 🏆 **推荐**：显示所有已配置密钥的 API |
| `all` | 同上，显示所有 API |
| `deepseek` | 只显示 DeepSeek |
| `openrouter` | 只显示 OpenRouter |
| `siliconflow` | 只显示 SiliconFlow |
| `deepseek,openrouter` | 组合 DeepSeek + OpenRouter |
| `1` | （兼容旧版）DeepSeek |
| `2` | （兼容旧版）OpenRouter |
| `5` | （兼容旧版）SiliconFlow |

### 使用示例

```
参数: deepseek       → 一个大小组件，只显示 DeepSeek 余额
参数: (留空)         → 同时显示 DeepSeek / OpenRouter / SiliconFlow
参数: openrouter,5   → 显示 OpenRouter 和 SiliconFlow（混用名称和数字）
```

---

## 🎨 余额颜色规则

| 金额 | 颜色 | 含义 |
|-----|------|------|
| ≥ 50 | 🟢 `systemGreen` | 充足 |
| ≥ 10 | 🟠 `systemOrange` | 偏低，注意补充 |
| < 10 | 🔴 `systemRed` | 不足，请尽快充值 |

---

## ⚠️ 智能错误分类

| 错误 | 显示内容 | 解决方法 |
|------|---------|---------|
| 401 Unauthorized | 🔑 密钥无效或已过期 | 在设置中更新 API Key |
| 429 Rate Limit | ⏰ 请求过于频繁 | 等待几分钟后刷新 |
| 403 Forbidden | 🔒 密钥无权限 | 检查 API 权限设置 |
| 网络超时 | 📡 服务暂时不可用 | 检查网络连接后重试 |
| 其他 | ⚠️ 具体错误信息 | 根据提示处理 |

---

## 📲 安装步骤

### 1. 安装 Scripting 应用
从 App Store 下载 [Scripting](https://apps.apple.com/app/scripting/id9116223691)

### 2. 导入项目
将以下文件复制到 Scripting 应用的「项目」目录中：

```
api-balance/
├── index.tsx           # 设置界面
├── widget.tsx          # 小组件（多 API 组合版）
├── constants.ts        # API 配置和工具函数
├── app_intents.tsx     # 刷新交互
├── icons/              # 品牌图标
│   ├── DeepSeek.svg
│   ├── OpenRouter.svg
│   └── SiliconFlow.svg
```

或者直接下载 `api-balance.scripting` 文件，在 Scripting 中导入。

### 3. 配置 API 密钥
1. 在 Scripting 中打开项目，运行 `index.tsx`
2. 分别设置 DeepSeek、OpenRouter、SiliconFlow 的 API Key
3. 密钥保存在 iOS **设备私有存储**中，安全可靠

### 4. 添加桌面小组件
1. iPhone 桌面长按 → 左上角 `+` 号
2. 搜索 **"Scripting"** → 选择合适大小的小组件
3. 点击小组件 → 选择 `api-balance` 脚本
4. 「参数」栏**留空**（显示全部），或按上表填写
5. 点击完成 ✅

---

## 🔑 获取 API 密钥

| 平台 | 获取地址 |
|------|---------|
| **DeepSeek** | https://platform.deepseek.com → API Keys |
| **OpenRouter** | https://openrouter.ai/keys → 创建 Key |
| **硅基流动** | https://siliconflow.cn/ → 个人中心 → API Key |

---

## 📄 文件结构

| 文件 | 说明 |
|------|------|
| `api-balance.scripting` | Scripting 项目打包文件 |
| `index.tsx` | 设置界面（API Key 管理） |
| `widget.tsx` | 小组件主逻辑（多 API 组合版） |
| `constants.ts` | API 配置 + 阈值常量 + 工具函数 |
| `app_intents.tsx` | 刷新交互定义 |
| `icons/` | 各平台 Logo SVG 图标 |
| `README.md` | 本说明文档 |

---

## 📜 开源协议

基于 [MIT](LICENSE) 协议开源。
