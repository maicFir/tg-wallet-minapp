'use client';

import React, { ReactNode, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
// 导入即触发 createAppKit（模块级别，客户端守卫）
import { wagmiAdapter } from '@/config/reown';

// Web3Ready context 保留，供 WalletConnector 等组件判断是否已挂载
const Web3ReadyContext = createContext(true);
export const useWeb3Ready = () => useContext(Web3ReadyContext);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 24,
            retry: 0,
            refetchOnWindowFocus: false,
        },
    },
});

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <Web3ReadyContext.Provider value={true}>
                    {children}
                </Web3ReadyContext.Provider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
