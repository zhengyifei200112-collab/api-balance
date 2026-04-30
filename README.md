# AI API Balance Widget

一个基于 iOS Scripting 应用的多 API 余额查询桌面小组件，支持 DeepSeek、OpenRouter、阿里云、MiniMax 和 SiliconFlow 五大平台的余额/用量查询。

## 功能特点

- 🔐 **安全存储** - API 密钥保存在设备私有存储中
- 🔄 **自动刷新** - 小组件自动定时刷新余额（MiniMax 除外）
- 📱 **手动刷新** - 点击刷新按钮即时更新数据
- 🎨 **品牌配色** - 每个 API 使用官方品牌色彩
- 🌐 **中文界面** - 全中文显示，易于使用

## 支持的 API

| API | 参数值 | 显示内容 | 刷新方式 |
|-----|--------|----------|----------|
| DeepSeek | 1 | 账户余额 | 自动刷新 |
| OpenRouter | 2 | 账户余额 | 自动刷新 |
| 阿里云 | 3 | 账户余额 | 自动刷新 |
| MiniMax | 4 | Token Plan 用量 | 手动刷新 |
| SiliconFlow | 5 | 账户余额 | 自动刷新 |

## 预览效果

### MiniMax Token Plan
![MiniMax Widget](svg/minimax.svg)
- 显示当前窗口额度剩余量
- 显示本周累计消耗
- 显示重置倒计时
- 需手动点击刷新按钮获取最新数据

### SiliconFlow
![SiliconFlow Widget](svg/SiliconFlow.svg)
- 显示账户余额
- 自动定时刷新

## 安装步骤

### 1. 安装 Scripting 应用
从 App Store 下载并安装 [Scripting 应用](https://apps.apple.com/app/scripting/id9116223691)

### 2. 复制项目文件
将以下文件复制到 Scripting 应用的项目目录：
```
api-balance/
├── index.tsx      # 设置界面主文件
├── widget.tsx     # 小组件实现
├── constants.ts   # API 配置
├── app_intents.tsx # 交互意图
└── icons/         # 图标文件夹
    ├── DeepSeek.svg
    ├── OpenRouter.svg
    ├── Aliyun.svg
    ├── MiniMax.svg
    └── SiliconFlow.svg
```

### 3. 配置小组件
1. 打开 Scripting 应用
2. 进入项目设置，添加桌面小组件
3. 为不同 API 创建多个小组件实例
4. 设置小组件参数（Parameter）：

| API | 参数值 |
|-----|--------|
| DeepSeek | 1 |
| OpenRouter | 2 |
| 阿里云 | 3 |
| MiniMax | 4 |
| SiliconFlow | 5 |

### 4. 获取 API 密钥

#### DeepSeek
1. 访问 [DeepSeek Platform](https://platform.deepseek.com)
2. 登录后在 API Keys 页面创建新密钥
3. 复制密钥

#### OpenRouter
1. 访问 [OpenRouter](https://openrouter.ai/keys)
2. 登录后创建新的 API Key
3. 复制密钥

#### 阿里云
1. 访问 [阿里云 RAM 控制台](https://ram.console.aliyun.com/users)
2. 创建 AccessKey 或使用现有 AccessKey
3. 需要 AccessKey ID 和 AccessKey Secret

#### MiniMax
1. 访问 [MiniMax Platform](https://platform.minimaxi.com/)
2. 登录后在 API Keys 页面创建新密钥
3. 复制密钥

#### SiliconFlow
1. 访问 [SiliconFlow](https://siliconflow.cn/)
2. 注册并登录
3. 在个人中心获取 API Key
4. 复制密钥

### 5. 设置密钥
1. 打开 Scripting 应用
2. 运行主程序 `index.tsx`
3. 选择对应的 API
4. 粘贴并保存密钥

## 使用说明

### 查看余额
1. 在桌面添加对应的小组件
2. 设置小组件参数为所需的 API 值
3. 小组件将自动显示余额信息

### 刷新数据
- **DeepSeek/OpenRouter/阿里云/SiliconFlow**: 每 5 分钟自动刷新
- **MiniMax**: 点击刷新按钮手动刷新（避免自动查询消耗 Token）

### 常见问题

#### Q: 小组件显示"未设置API密钥"
A: 请先运行主程序 `index.tsx`，按照步骤设置对应 API 的密钥。

#### Q: 小组件显示错误信息
A: 请检查：
1. API 密钥是否正确
2. API 密钥是否有效/未过期
3. 网络连接是否正常

#### Q: MiniMax 为什么是手动刷新？
A: MiniMax API 查询会消耗 Token，为了避免自动刷新造成不必要的消耗，采用手动刷新方式。

## 文件说明

```
api-balance/
├── index.tsx          # 主程序入口 - API 密钥管理界面
├── widget.tsx         # 小组件实现 - 余额显示逻辑
├── constants.ts      # 配置文件 - API 端点、品牌颜色等
├── app_intents.tsx   # 交互定义 - 刷新按钮功能
└── icons/            # 图标资源
```

## 技术实现

- **前端框架**: React-like TSX (Scripting)
- **存储方式**: iOS 私有存储 (Storage API)
- **网络请求**: Fetch API
- **签名方式**: HMAC-SHA1 (阿里云)
- **小组件**: iOS Widget Extension


## 许可证

本项目仅供个人学习交流使用，请勿用于商业用途。各 API 服务的使用条款请参考各平台官方说明。

## 更新日志

### v1.0.0
- 支持 5 个主流 AI API 平台
- MiniMax 手动刷新保护
- 品牌官方配色
- 私有存储安全保护
