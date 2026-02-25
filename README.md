# TG Wallet Mini App



## 🌟 主要特性

- 🔗 **多链支持**：原生支持 以太坊主网 (Ethereum) 和 币安智能链 (BSC)。
- 📱 **Telegram 深度优化**：
  - 自动适配 Telegram WebApp 环境，支持 `expand()` 和 `ready()`。
  - 针对 iOS 端 Telegram 无法唤起钱包的问题，实现了 Universal Links 与 Deep Links 的自动转换与保护。
- 🛠️ **稳健的钱包集成**：
  - **自定义钱包支持**：内置 AB PAY 钱包配置。
  - **主流钱包适配**：优化了 OKX、MetaMask、Trust Wallet 等在 TMA 中的唤起率。
  - **自动故障修复**：内置“终极清理”机制，自动解决 WalletConnect 常见的 `restore` 和 `indexedDB` 报错。
- 🚀 **现代技术栈**：使用 Next.js 16 + React 19 + Wagmi v2 + Viem + RainbowKit。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (Turbopack)
- **Web3 底层**: [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/)
- **UI 组件**: [RainbowKit](https://www.rainbowkit.com/)
- **SDK**: [Telegram WebApp SDK](https://core.telegram.org/bots/webapps)

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
在项目根目录创建 `.env.development` 或 `.env.production`：
```env
NEXT_PUBLIC_WC_PROJECT_ID=你的_WALLETCONNECT_项目ID
```

### 3. 本地开发
```bash
pnpm dev
```
使用 Telegram 开发者工具或隧道工具（如 Cloudflare Tunnel / Ngrok）在真机 Telegram 中测试。

## 🔧 核心架构说明

### 环境就绪探测 (Web3Provider)
为了解决 SSR 导致的 `window is not defined` 和 WalletConnect 初始化冲突，项目采用了 `useWeb3Ready` 守卫：
- 页面加载时执行物理存储清理（清除残留的损坏 Session）。
- 确认环境干净后同步生成 Wagmi Config。
- 仅在客户端环境就绪后渲染 Web3 组件。

### iOS 唤起修复逻辑
针对 iOS 的特殊限制，唤起逻辑经过了以下优化：
1. **Universal Links 优先**：如果钱包提供 https 格式链接，优先使用。
2. **模拟点击 + Location 降级**：对于自定义 Schema，通过动态创建 `<a>` 标签模拟用户行为，绕过静默拦截。
3. **Telegram 增强**：使用 `WebApp.openLink` 并设置 `try_instant_view: false`。

## 📂 目录结构
- `src/config/wagmi.ts`: 钱包连接、链配置及 iOS 唤起逻辑中心。
- `src/providers/Web3Provider.tsx`: 负责环境清理、Provider 注入与状态守卫。
- `src/components/WalletConnector.tsx`: 钱包连接按钮及 UI。
- `src/types/telegram.d.ts`: Telegram SDK 的类型定义扩展。

## 🆘 常见问题

**Q: 页面提示 "WagmiProviderNotFoundError"?**
A: 这是因为子组件在 Web3 环境还没初始化完成时就尝试调用 Hook。目前的 `WalletConnector` 已通过 `isReady` 状态修复。

**Q: 连接钱包时报错 "ki.restore"?**
A: 项目已内置自动清理逻辑。如果仍出现，请在浏览器控制台执行 `indexedDB.deleteDatabase('WALLET_CONNECT_V2_CORE')` 并刷新。

## 🔗 相关链接
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Telegram Mini App Docs](https://core.telegram.org/bots/webapps)
