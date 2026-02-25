'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { CustomConnectButton } from './CustomConnectButton';
import { useWeb3Ready } from '@/providers/Web3Provider';

/**
 * 依赖 Wagmi Hooks 的子组件
 */
function WalletConnectorContent() {
    // 只有在 Web3Provider 确认就绪后才会被渲染，所以这里调用 useAccount 是安全的
    const { address, isConnected, chain } = useAccount();

    return (
        <>
            <section className="button-section">
                <span className="section-label">SDK Standard Button</span>
                <ConnectButton />
            </section>

            <div className="divider"></div>

            <section className="button-section">
                <span className="section-label">Custom Specialized Button</span>
                <CustomConnectButton />
            </section>

            {isConnected && (
                <div className="account-info">
                    <div className="status-badge">
                        <span className="dot"></span>
                        Connected
                    </div>
                    <p className="address-text">{address}</p>
                    <p className="network-text">Using {chain?.name} Network</p>
                </div>
            )}
        </>
    );
}

export default function WalletConnector() {
    const isReady = useWeb3Ready();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (process.env.NODE_ENV === 'development') {
            import('eruda').then((eruda) => eruda.default.init());
        }
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    }, []);

    // 关键修复：
    // 1. 如果没挂载到客户端，直接返回通用 Loading
    // 2. 即使挂载了，如果 Web3Provider 还没清理完环境 (isReady 为 false)，依然返回 Loading
    // 只有两项都满足，才渲染 WalletConnectorContent (内部含有 Hook 调用)
    if (!mounted || !isReady) {
        return (
            <div className="connector-container" style={{ minHeight: '300px' }}>
                <div className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                    Initializing Wallet Environment...
                </div>
            </div>
        );
    }

    return (
        <div className="connector-container">
            <WalletConnectorContent />

            <style jsx global>{`
                .custom-btn {
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .connect-btn {
                    background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
                }
                .chain-btn {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .account-btn {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .error-btn { background: #ff4d4f; color: white; }
            `}</style>

            <style jsx>{`
                .connector-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 28px;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 420px;
                }
                .button-section {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 0;
                }
                .section-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.3);
                }
                .divider {
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
                }
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(0, 218, 149, 0.1);
                    color: #00da95;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                }
                .address-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    font-family: monospace;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 8px 12px;
                    border-radius: 8px;
                    word-break: break-all;
                }
            `}</style>
        </div>
    );
}
