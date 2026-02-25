/**
 * Reown AppKit 配置
 * 支持：EVM (Ethereum Mainnet) + BSC
 * 按照官方推荐，在客户端模块加载时立即初始化
 */
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc } from '@reown/appkit/networks';
import type { AppKit } from '@reown/appkit';

export const projectId =
    process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'd1e2a22cfcfd75064bfc27b0bc8caa8c';

export const networks = [mainnet, bsc] as [typeof mainnet, ...typeof bsc[]];

export const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: false,
});

// AB PAY 自定义钱包
const customAbPay = {
    id: 'abpay',
    name: 'AB Pay',
    homepage: 'https://www.abpay.cash',
    image_url: `https://explorer-api.walletconnect.com/v3/logo/sm/f635dbaa-dd03-419c-5dce-05aa0f127c00?projectId=${projectId}`,
    mobile_link: 'abpay://',
    app_store: 'https://apps.apple.com/us/app/ab-wallet/id6745787849',
    play_store: 'https://play.google.com/store/apps/details?id=org.ab.abwallet.android.release',
};

/**
 * AppKit 实例（客户端可用，SSR 为 undefined）
 * 在模块加载时立即调用，确保在任何 Hook/组件使用前已就绪
 */
export let appKit: AppKit | undefined;

if (typeof window !== 'undefined') {
    appKit = createAppKit({
        adapters: [wagmiAdapter],
        networks,
        projectId,
        customWallets: [customAbPay],
        metadata: {
            name: 'TG Wallet MinApp',
            description: 'Telegram Mini App Wallet',
            url: window.location.origin,
            icons: [],
        },
        features: {
            analytics: false,
            email: false,
            socials: false,
            onramp: false,
            swaps: false,
        },
        themeMode: 'dark',
        themeVariables: {
            '--w3m-accent': '#00da95',
            '--w3m-border-radius-master': '12px',
        },
        allWallets: 'SHOW',
    });
}

export { mainnet, bsc };
