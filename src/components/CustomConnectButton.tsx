'use client';

import '@/config/reown';
import { appKit } from '@/config/reown';
import { useAccount } from 'wagmi';
import React from 'react';

export const CustomConnectButton = () => {
    const { address, isConnected, chain } = useAccount();

    if (!isConnected) {
        return (
            <button
                onClick={() => appKit?.open({ view: 'Connect' })}
                type="button"
                className="custom-btn connect-btn"
            >
                Connect Wallet
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', gap: 12 }}>
            <button
                onClick={() => appKit?.open({ view: 'Networks' })}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                type="button"
                className="custom-btn chain-btn"
            >
                {chain?.name ?? 'Switch Network'}
            </button>
            <button
                onClick={() => appKit?.open({ view: 'Account' })}
                type="button"
                className="custom-btn account-btn"
            >
                {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Account'}
            </button>
        </div>
    );
};
