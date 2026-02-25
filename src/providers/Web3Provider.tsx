'use client';

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { getWagmiConfig } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

// 定义一个上下文，用于告知子组件 Web3 环境是否已就绪
const Web3ReadyContext = createContext(false);

export const useWeb3Ready = () => useContext(Web3ReadyContext);

const performUltimateCleanup = async () => {
    if (typeof window === 'undefined') return;
    const CLEANUP_KEY = 'wc_ultimate_cleanup_v6';
    if (sessionStorage.getItem(CLEANUP_KEY)) return;

    try {
        // 清理 LocalStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('walletconnect') || key.includes('wc@2') || key.includes('wagmi')) {
                localStorage.removeItem(key);
            }
        });

        // 强力清理 IndexedDB
        if (window.indexedDB && window.indexedDB.databases) {
            const dbs = await window.indexedDB.databases();
            await Promise.all(dbs.map(db => {
                if (db.name && (db.name.includes('walletconnect') || db.name.includes('wc@2') || db.name.includes('WALLET_CONNECT'))) {
                    return new Promise((resolve) => {
                        const req = window.indexedDB.deleteDatabase(db.name!);
                        req.onsuccess = resolve;
                        req.onerror = resolve;
                        req.onblocked = resolve;
                    });
                }
                return Promise.resolve();
            }));
        }
    } catch (e) { }

    sessionStorage.setItem(CLEANUP_KEY, 'true');
};

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [config, setConfig] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            await performUltimateCleanup();
            const wagmiConfig = getWagmiConfig();
            setConfig(wagmiConfig);
            setIsReady(true);
        };
        init();
    }, []);

    // 如果还没有就绪，渲染 children 但不包裹 Provider (此时子组件内部会有 useWeb3Ready 守卫)
    // 这样可以确保页面框架能立即显示，不会出现空白页
    if (!isReady || !config) {
        return (
            <Web3ReadyContext.Provider value={false}>
                {children}
            </Web3ReadyContext.Provider>
        );
    }

    return (
        <Web3ReadyContext.Provider value={true}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider locale="en-US" theme={darkTheme()}>
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </Web3ReadyContext.Provider>
    );
}
