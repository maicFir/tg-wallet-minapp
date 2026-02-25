'use client';

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { getWagmiConfig } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

const Web3ReadyContext = createContext(false);
export const useWeb3Ready = () => useContext(Web3ReadyContext);

const performFinalReset = async () => {
    if (typeof window === 'undefined') return;

    const RESET_KEY = 'wc_final_reset_v9.1';
    if (sessionStorage.getItem(RESET_KEY)) return;

    try {
        console.warn('[Web3] Performing Mandatory Environment Purge...');

        // 1. 强力清除本地存储
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            const k = key.toLowerCase();
            if (k.includes('walletconnect') || k.includes('wc@2') || k.includes('wagmi') || k.includes('tg-wallet')) {
                localStorage.removeItem(key);
            }
        });

        // 2. 强力清除数据库
        if (window.indexedDB && window.indexedDB.databases) {
            const dbs = await window.indexedDB.databases();
            for (const db of dbs) {
                if (db.name && (db.name.includes('walletconnect') || db.name.includes('wc@2'))) {
                    await new Promise((resolve) => {
                        const req = window.indexedDB.deleteDatabase(db.name!);
                        req.onsuccess = resolve;
                        req.onerror = resolve;
                        req.onblocked = resolve;
                        setTimeout(resolve, 300);
                    });
                }
            }
        }

        sessionStorage.setItem(RESET_KEY, 'true');
        console.warn('[Web3] Environment Purge Completed.');
    } catch (e) {
        console.error('[Web3] Reset Failed', e);
    }
};

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [config, setConfig] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            await performFinalReset();
            // 停顿 200ms 确保浏览器 IO 完成
            await new Promise(r => setTimeout(r, 200));
            const wagmiConfig = getWagmiConfig();
            setConfig(wagmiConfig);
            setIsReady(true);
        };
        init();
    }, []);

    if (!isReady || !config) {
        return (
            <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#00da95' }}>Securing Web3 Environment...</div>
                <div style={{ display: 'none' }}>{children}</div>
            </div>
        );
    }

    return (
        <Web3ReadyContext.Provider value={isReady}>
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
