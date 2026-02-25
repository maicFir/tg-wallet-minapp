'use client';

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { getWagmiConfig } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

const Web3ReadyContext = createContext(false);
export const useWeb3Ready = () => useContext(Web3ReadyContext);

/**
 * 优化后的环境清理策略：仅在重大版本变更时清理
 * 解决“无法长连接”的问题，防止每次关闭小程序都断开连接
 */
const performMaintenanceCleanup = async () => {
    if (typeof window === 'undefined') return;

    // 版本标记：只有在更新这个字符串（如改为 v11）时才会触发全量清理
    const APP_VERSION_FLAG = 'tg-web3-stable-v10.1';

    // 使用 localStorage 代替 sessionStorage，确保跨 Session 持久化
    if (localStorage.getItem(APP_VERSION_FLAG)) return;

    try {
        console.warn('[Web3] Performing One-Time Environment Migration...');

        // 只清理以前旧版本的、可能冲突的键名
        const oldPrefixes = ['walletconnect', 'wc@2', 'wagmi', 'tg-wallet'];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            const k = key.toLowerCase();
            // 注意：我们不要清理当前正在使用的 'tg-miniapp-wallet-v1'
            if (k !== 'tg-miniapp-wallet-v1' && oldPrefixes.some(p => k.includes(p))) {
                localStorage.removeItem(key);
            }
        });

        // 清理旧的数据库
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

        // 标记清理已完成，只要不手动清除 localStorage，下次不会再跑这段逻辑
        localStorage.setItem(APP_VERSION_FLAG, 'true');
        console.warn('[Web3] Migration Completed.');
    } catch (e) {
        console.error('[Web3] Migration Failed', e);
    }
};

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5分钟内数据不失效
                gcTime: 1000 * 60 * 60 * 24, // 24小时垃圾回收
            },
        },
    }));
    const [config, setConfig] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            // 执行维护性清理（仅跑一次）
            await performMaintenanceCleanup();

            // 立即生成 Config 并标记准备就绪
            const wagmiConfig = getWagmiConfig();
            setConfig(wagmiConfig);
            setIsReady(true);
        };
        init();
    }, []);

    if (!isReady || !config) {
        return (
            <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#00da95', fontSize: '14px' }}>Loading...</div>
                {/* SSR 占位 */}
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
