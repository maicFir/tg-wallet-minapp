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

    // 1. 构造最可能的成功 Deep Link
    let finalLink = uri;
    const cleanPrefix = prefix.replace('://', '');

    if (isIOS()) {
        if (cleanPrefix === 'okx') {
            // OKX iOS 专用稳定路径
            finalLink = `okx://main/wc?uri=${encodedUri}`;
        } else if (universalLink) {
            // 如果有 Universal Link (https)，直接使用，不拼接 uri（除非是特定格式）
            finalLink = `${universalLink}${universalLink.includes('?') ? '&' : '?'}uri=${encodedUri}`;
        } else {
            finalLink = `${cleanPrefix}://wc?uri=${encodedUri}`;
        }
    }

    // 2. 核心：执行跳转
    if (webApp) {
        // 尝试使用 Telegram SDK 唤起
        // try_instant_view: false 防止被 TG 内部预览拦截
        webApp.openLink(finalLink, { try_instant_view: false });

        // 策略回退：如果 openLink 没反应（部分 iOS 版本限制），
        // 延迟 100ms 使用 location.href 强制触发
        setTimeout(() => {
            window.location.href = finalLink;
        }, 150);
    } else {
        window.location.href = finalLink;
    }
};

/**
 * 自定义 AB PAY 钱包定义
 */
const abPayWallet = ({ projectId }: { projectId: string }) => () => ({
    id: 'abpay',
    name: 'AB PAY',
    iconUrl: 'https://i.mij.rip/2026/02/25/0d5e8b6d73c2db99f659114a599f4028.webp',
    iconBackground: '#ffffff',
    downloadUrls: {
        android: 'https://www.abpay.cash/',
        ios: 'https://www.abpay.cash/',
        qrCode: 'https://www.abpay.cash/',
    },
    mobile: {
        getUri: (uri: string) => {
            console.log('AB PAY Attempt:', uri);
            openInTelegramSafe(uri, 'abpay://');
            return uri;
        },
    },
    qrCode: {
        getUri: (uri: string) => uri,
        instructions: {
            learnMoreUrl: 'https://www.abpay.cash/',
            steps: [
                { description: 'Open the AB Pay app', step: 'install' as const, title: 'Open AB Pay' },
                { description: 'Scan to connect', step: 'scan' as const, title: 'Tap Scan' },
            ],
        },
    },
    createConnector: getWalletConnectConnector({ projectId }),
});

/**
 * 修复 OKX 钱包 iOS 无法唤起
 * 使用官方 Universal Link
 */
const customOkxWallet = ({ projectId }: { projectId: string }) => {
    const wallet = okxWallet({ projectId });
    return {
        ...wallet,
        mobile: {
            ...wallet.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'okx://', 'https://www.okx.com/download');
                return uri;
            },
        },
    };
};

/**
 * 修复 MetaMask 钱包 iOS 无法唤起
 */
const customMetaMaskWallet = ({ projectId }: { projectId: string }) => {
    const wallet = metaMaskWallet({ projectId });
    return {
        ...wallet,
        mobile: {
            ...wallet.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'metamask://', 'https://metamask.app.link/wc');
                return uri;
            },
        },
    };
};

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'd1e2a22cfcfd75064bfc27b0bc8caa8c';
const appName = 'TG Wallet MinApp';

export const getWagmiConfig = () => {
    const connectors = connectorsForWallets(
        [
            {
                groupName: 'Recommended',
                wallets: [
                    abPayWallet({ projectId }),
                    // customOkxWallet({ projectId }), // 必须使用修复版的 OKX
                    // customMetaMaskWallet({ projectId }), // 必须使用修复版的 MetaMask
                    binanceWallet,
                    bitgetWallet,
                    trustWallet,
                    walletConnectWallet,
                ],
            },
            {
                groupName: 'Others',
                wallets: [
                    rainbowWallet,
                    coinbaseWallet,
                ],
            },
        ],
        {
            appName,
            projectId,
        }
    );

    return createConfig({
        connectors,
        chains: [mainnet, bsc],
        storage: createStorage({
            key: 'tg-wallet-v6-final',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }),
        transports: {
            [mainnet.id]: http(),
            [bsc.id]: http(),
        },
        ssr: false,
    });
};
