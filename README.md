# AI API Balance Widget — 多 API 余额小组件

基于 [Dlian-Zero/api-balance](https://github.com/Dlian-Zero/api-balance) 优化改进。

一个 iOS Scripting 应用的桌面小组件，在 iPhone 桌面上直接查看 DeepSeek、OpenRouter、硅基流动的 API 余额。

## 🆕 改进亮点

| 优化项 | 说明 |
|-------|------|
| **多 API 组合模式** | 一个小组件同时显示所有平台的余额，无需摆放多个小组件 |
| **灵活的参数选择** | 支持名称/数字/逗号分隔三种参数格式，想显示什么组合都行 |
| **余额阈值颜色** | ≥$50 绿色 🟢、$10~$50 橙色 🟠、<$10 红色 🔴，一眼知余额 |
| **智能错误分类** | 密钥无效 / 频率限制 / 网络中断，精确提示对应解决方案 |
| **更新时间显示** | 显示"刚刚"/"5分钟前"等相对时间，数据新鲜度一目了然 |

## 支持的 API

| API | 参数（名称） | 参数（数字） |
|-----|------------|------------|
| DeepSeek | `deepseek` | `1` |
| OpenRouter | `openrouter` | `2` |
| SiliconFlow | `siliconflow` | `5` |

## 小组件参数用法

在 iOS 桌面上添加 Scripting 小组件后，在"参数"栏填入：

| 参数值 | 效果 | 示例 |
|-------|------|------|
| 留空 / `all` | 显示所有已配置密钥的 API | （最推荐） |
| `deepseek` | 只显示 DeepSeek | |
| `openrouter` | 只显示 OpenRouter | |
| `siliconflow` | 只显示 SiliconFlow | |
| `deepseek,openrouter` | 组合 DeepSeek + OpenRouter | 只看你想看的 |
| `1` | 兼容旧版：只显示 DeepSeek | |
| `2,5` | 兼容旧版：显示 OpenRouter + SiliconFlow | |

## 余额颜色规则

| 余额 | 颜色 | 状态 |
|------|------|------|
| ≥ 50 | 🟢 systemGreen | 充足 |
| ≥ 10 | 🟠 systemOrange | 偏低 |
| < 10 | 🔴 systemRed | 不足 |

## 安装步骤

### 1. 安装 Scripting 应用
从 App Store 下载 [Scripting](https://apps.apple.com/app/scripting/id9116223691)

### 2. 导入项目文件
将以下文件复制到 Scripting 应用的项目目录：

```
api-balance/
├── index.tsx           # 设置界面
├── widget.tsx          # 小组件（多 API 组合版）
├── constants.ts        # API 配置和工具函数
├── app_intents.tsx     # 刷新交互
├── icons/
│   ├── DeepSeek.svg
│   ├── OpenRouter.svg
│   └── SiliconFlow.svg
```

### 3. 配置密钥
1. 在 Scripting 中打开项目，运行 `index.tsx`
2. 分别设置 DeepSeek、OpenRouter、SiliconFlow 的 API Key
3. Key 保存在 iOS 设备私有存储中

### 4. 添加桌面小组件
1. 回到桌面，长按 → 左上角 + 号
2. 搜索 "Scripting" → 选择合适大小的小组件
3. 点击小组件 → 选择 `api-balance` 脚本
4. 参数栏按上述说明填写（留空=显示全部）
5. 完成 ✅

## 获取 API 密钥

| 平台 | 获取地址 |
|------|---------|
| DeepSeek | https://platform.deepseek.com |
| OpenRouter | https://openrouter.ai/keys |
| 硅基流动 | https://siliconflow.cn/ |
