'use client';

// 加载此模块即触发 createAppKit（模块级别初始化）
import '@/config/reown';
import { appKit } from '@/config/reown';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Ready } from '@/providers/Web3Provider';

/**
 * 核心连接内容
 * 不再使用 useAppKit() hook，改用直接调用 appKit 实例方法
 * 这样可以完全避免 "createAppKit must be called before useAppKit" 问题
 */
function WalletConnectorContent() {
    const { address, isConnected, chain } = useAccount();

    const handleOpen = (view: 'Connect' | 'Account' | 'Networks') => {
        appKit?.open({ view });
    };

    return (
        <>
            <section className="button-section">
                {/* Reown AppKit 原生 Web Component 按钮 */}
                <appkit-button />
            </section>

            <div className="divider" />

            <section className="button-section">
                <span className="section-label">Custom Button</span>
                {isConnected ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            type="button"
                            className="custom-btn chain-btn"
                            onClick={() => handleOpen('Networks')}
                        >
                            {chain?.name ?? 'Switch Network'}
                        </button>
                        <button
                            type="button"
                            className="custom-btn account-btn"
                            onClick={() => handleOpen('Account')}
                        >
                            {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Account'}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="custom-btn connect-btn"
                        onClick={() => handleOpen('Connect')}
                    >
                        Connect Wallet
                    </button>
                )}
            </section>

            {isConnected && (
                <div className="account-info">
                    <div className="status-badge">
                        <span className="dot" />
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

    if (!mounted) {
        return (
            <div className="connector-container" style={{ minHeight: '200px' }}>
                <div className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                    Loading...
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
                    background: linear-gradient(135deg, #00da95 0%, #00b37a 100%);
                    color: #000;
                    box-shadow: 0 4px 15px rgba(0, 218, 149, 0.3);
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
                .dot {
                    width: 6px;
                    height: 6px;
                    background: #00da95;
                    border-radius: 50%;
                }
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
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
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
                .account-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin-top: 16px;
                    width: 100%;
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
                .network-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
}
