'use client';

import WalletConnector from '@/components/WalletConnector';

export default function Home() {
  return (
    <main className="container">
      <div className="hero">
        <h1 className="title">TG Web3 Wallet</h1>
        <p className="subtitle">
          Securely connect your wallet within Telegram Mini App
        </p>
      </div>

      <WalletConnector />

      <div className="features">
        <div className="feature-item">
          <span>Multi-Chain support (EVM, BSC)</span>
        </div>
        <div className="feature-item">
          <span>Secure Persistence</span>
        </div>
      </div>

      <style jsx>{`
        .features {
          margin-top: 50px;
          display: grid;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }
        .feature-item {
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          font-size: 14px;
          color: #888;
        }
      `}</style>
    </main>
  );
}
