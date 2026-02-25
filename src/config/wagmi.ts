import { connectorsForWallets, getWalletConnectConnector } from '@rainbow-me/rainbowkit';
import {
    metaMaskWallet,
    okxWallet,
    binanceWallet,
    walletConnectWallet,
    rainbowWallet,
    coinbaseWallet,
    trustWallet,
    bitgetWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, bsc } from 'wagmi/chains';
import { createConfig, http, createStorage } from 'wagmi';

/**
 * 辅助函数：判断是否为 iOS 环境
 */
const isIOS = () => typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * 辅助函数：在 Telegram 中安全唤起深层链接
 */
const openInTelegramSafe = (uri: string, prefix: string, universalLink?: string) => {
    if (typeof window === 'undefined') return;
    const webApp = window.Telegram?.WebApp;
    const encodedUri = encodeURIComponent(uri);

    // 1. 针对常见的钱包采用最稳健的 Universal Link 桥接方案
    let finalLink = uri;
    const cleanPrefix = prefix.replace('://', '');

    if (isIOS()) {
        if (cleanPrefix === 'okx' || cleanPrefix === 'okex') {
            // OKX 的终极兼容方案：通过其官方下载页中转带参数的 Deeplink
            finalLink = `https://www.okx.com/download?deeplink=${encodeURIComponent(`okx://web3/wallet/walletConnect?uri=${encodedUri}`)}`;
        } else if (cleanPrefix === 'metamask') {
            finalLink = `https://metamask.app.link/wc?uri=${encodedUri}`;
        } else if (universalLink) {
            finalLink = `${universalLink}${universalLink.includes('?') ? '&' : '?'}uri=${encodedUri}`;
        } else {
            finalLink = `${cleanPrefix}://wc?uri=${encodedUri}`;
        }
    }

    // 2. 执行跳转
    if (webApp && finalLink.startsWith('http')) {
        // 对于 https 链接，openLink 是最稳妥的唤起手段
        webApp.openLink(finalLink, { try_instant_view: false });
    } else {
        // 自定义协议 (abpay:// 等) 使用 location 兜底
        window.location.href = finalLink;

        // 针对某些 iOS 版本的 Telegram，再次尝试模拟点击
        setTimeout(() => {
            if (!document.hidden) {
                const a = document.createElement('a');
                a.href = finalLink;
                a.click();
            }
        }, 100);
    }
};

/**
 * 自定义 AB PAY 钱包
 */
const abPayWallet = ({ projectId }: { projectId: string }) => () => ({
    id: 'abpay',
    name: 'AB PAY',
    iconUrl: `https://explorer-api.walletconnect.com/v3/logo/sm/f635dbaa-dd03-419c-5dce-05aa0f127c00?projectId=${projectId}`,
    iconBackground: '#ffffff',
    downloadUrls: {
        android: 'https://play.google.com/store/apps/details?id=org.ab.abwallet.android.release',
        ios: 'https://apps.apple.com/us/app/ab-wallet/id6745787849',
        qrCode: 'https://www.abpay.cash/',
    },
    mobile: {
        getUri: (uri: string) => {
            openInTelegramSafe(uri, 'abpay', "https://www.abpay.cash");
            return uri;
        },
    },
    qrCode: { getUri: (uri: string) => uri },
    createConnector: getWalletConnectConnector({ projectId }),
});

/**
 * 修复版 OKX 钱包 - 强制在生产环境显示
 */
const customOkxWallet = ({ projectId }: { projectId: string }) => () => {
    const wallet = okxWallet({ projectId });
    return {
        ...wallet,
        hidden: () => false, // 强制显示，防止 RainbowKit 在特定 Webview 中将其隐藏
        mobile: {
            ...wallet.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'okx');
                return uri;
            },
        },
        qrCode: { getUri: (uri: string) => uri },
    } as any;
};

/**
 * 修复版 MetaMask 钱包 - 强制在生产环境显示
 */
const customMetaMaskWallet = ({ projectId }: { projectId: string }) => () => {
    const wallet = metaMaskWallet({ projectId });
    return {
        ...wallet,
        hidden: () => false, // 强制显示
        mobile: {
            ...wallet.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'metamask');
                return uri;
            },
        },
        qrCode: { getUri: (uri: string) => uri },
    } as any;
};

/**
 * 修复版 Binance 钱包 - 强制在生产环境显示
 */
const customBinanceWallet = ({ projectId }: { projectId: string }) => () => {
    const wallet = binanceWallet({ projectId });
    return {
        ...wallet,
        hidden: () => false, // 强制显示
        mobile: {
            ...wallet.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'bncus');
                return uri;
            },
        }
    } as any;
};

// 确保在 Vercel 生产环境下也能正确读取 Project ID
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'd1e2a22cfcfd75064bfc27b0bc8caa8c';
const appName = 'TG Wallet MinApp';

export const getWagmiConfig = () => {
    const connectors = connectorsForWallets(
        [
            {
                groupName: 'Recommended',
                wallets: [
                    abPayWallet({ projectId }),
                    // customOkxWallet({ projectId }),
                    // customMetaMaskWallet({ projectId }),
                    // customBinanceWallet({ projectId }),
                    okxWallet,
                    metaMaskWallet,
                    binanceWallet,
                    bitgetWallet,
                    trustWallet,
                    walletConnectWallet,
                ],
            },
        ],
        { appName, projectId }
    );

    return createConfig({
        connectors,
        chains: [mainnet, bsc],
        storage: createStorage({
            key: 'tg-wallet-v11-final',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }),
        transports: {
            [mainnet.id]: http(),
            [bsc.id]: http(),
        },
        ssr: false,
    });
};
