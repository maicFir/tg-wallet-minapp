import { connectorsForWallets, getWalletConnectConnector } from '@rainbow-me/rainbowkit';
import {
    walletConnectWallet,
    trustWallet,
    bitgetWallet,
    metaMaskWallet,
    okxWallet,
    binanceWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, bsc } from 'wagmi/chains';
import { createConfig, http, createStorage } from 'wagmi';

const isIOS = () =>
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

const openInTelegramSafe = (uri: string, prefix: string, universalLink?: string) => {
    if (typeof window === 'undefined') return;
    const webApp = window.Telegram?.WebApp;
    const encodedUri = encodeURIComponent(uri);
    let finalLink = uri;
    const cleanPrefix = prefix.replace('://', '');

    if (isIOS()) {
        if (cleanPrefix === 'okx') {
            // OKX 官方桥接链接
            finalLink = `https://www.okx.com/download?deeplink=${encodeURIComponent(
                `okx://web3/wallet/walletConnect?uri=${encodedUri}`
            )}`;
        } else if (cleanPrefix === 'metamask') {
            // MetaMask Universal Link
            finalLink = `https://metamask.app.link/wc?uri=${encodedUri}`;
        } else if (cleanPrefix === 'bncus') {
            finalLink = `bnwv2://wc?uri=${encodedUri}`;
        } else if (universalLink) {
            finalLink = `${universalLink}${universalLink.includes('?') ? '&' : '?'}uri=${encodedUri}`;
        } else {
            finalLink = `${cleanPrefix}://wc?uri=${encodedUri}`;
        }
    }

    if (webApp && finalLink.startsWith('http')) {
        webApp.openLink(finalLink, { try_instant_view: false });
    } else {
        window.location.href = finalLink;
        setTimeout(() => {
            if (!document.hidden) {
                const a = document.createElement('a');
                a.href = finalLink;
                a.click();
            }
        }, 100);
    }
};

const projectId =
    process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'd1e2a22cfcfd75064bfc27b0bc8caa8c';

/**
 * 判断是否运行在 Telegram 移动端 Mini App 中
 * 桌面端 TG Web（支持浏览器插件）不属于此类
 */
const isTelegramMobileApp = (): boolean => {
    if (typeof window === 'undefined') return false;
    const platform = window.Telegram?.WebApp?.platform;
    // ios / android = 手机端 TMA；tdesktop / weba / web = 桌面端
    return platform === 'ios' || platform === 'android' || isIOS();
};

// ─── Custom AB PAY (完全自定义，无内置对应) ────────────────────────────────
// AB PAY 没有内置钱包，使用纯 WalletConnect 接口
const customAbPay = (params: any): any => ({
    id: 'abpay',
    name: 'AB Pay',
    // 使用内置 WalletConnect 图标作为兜底
    iconUrl: `https://explorer-api.walletconnect.com/v3/logo/sm/f635dbaa-dd03-419c-5dce-05aa0f127c00?projectId=${projectId}`,
    iconBackground: '#111',
    installed: true,
    downloadUrls: {
        ios: 'https://apps.apple.com/us/app/ab-wallet/id6745787849',
        android: 'https://play.google.com/store/apps/details?id=org.ab.abwallet.android.release',
    },
    mobile: {
        getUri: (uri: string) => {
            openInTelegramSafe(uri, 'abpay', 'https://www.abpay.cash');
            return uri;
        },
    },
    qrCode: { getUri: (uri: string) => uri },
    createConnector: getWalletConnectConnector({ projectId }),
});

// ─── Custom OKX ──────────────────────────────────────────────────────────
const customOkx = (params: any): any => {
    const base = okxWallet(params);
    const isMobile = isTelegramMobileApp();
    return {
        ...base,
        // 移动端强制显示；桌面端保留原始安装状态检测（支持插件）
        ...(isMobile ? { installed: true, hidden: undefined } : {}),
        mobile: {
            ...base.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'okx');
                return uri;
            },
        },
    };
};

// ─── Custom MetaMask ──────────────────────────────────────────────────────
const customMetaMask = (params: any): any => {
    const base = metaMaskWallet(params);
    const isMobile = isTelegramMobileApp();
    return {
        ...base,
        ...(isMobile ? { installed: true, hidden: undefined } : {}),
        mobile: {
            ...base.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'metamask');
                return uri;
            },
        },
    };
};

// ─── Custom Binance ───────────────────────────────────────────────────────
const customBinance = (params: any): any => {
    const base = binanceWallet(params);
    return {
        ...base,
        installed: true,
        hidden: undefined,
        mobile: {
            ...base.mobile,
            getUri: (uri: string) => {
                openInTelegramSafe(uri, 'bncus');
                return uri;
            },
        },
    };
};

const appName = 'TG Wallet MinApp';

export const getWagmiConfig = () => {
    const connectors = connectorsForWallets(
        [
            {
                groupName: 'Recommended',
                wallets: [
                    customAbPay,
                    customOkx,
                    customMetaMask,
                    customBinance,
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
            key: 'tg-miniapp-wallet-v11',
            storage:
                typeof window !== 'undefined' ? window.localStorage : undefined,
        }),
        transports: {
            [mainnet.id]: http(),
            [bsc.id]: http(),
        },
        ssr: false,
    });
};
