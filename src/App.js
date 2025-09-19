import React, { useState } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import LiquidityManager from './components/LiquidityManagerNew';
import SwapComponent from './components/SwapComponentNew';
import './index.css';
import './App.css';

function App() {
  const {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isLoading,
    isCorrectNetwork,
    connectWallet,
    disconnect,
    switchToLocalNetwork,
    formatAddress
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('swap');

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🥩 BeefDex</h1>
          <p className="app-subtitle">基于 Uniswap V3 的去中心化交易所</p>
          
          <div className="wallet-section">
            {!isConnected ? (
              <button 
                onClick={connectWallet} 
                disabled={isLoading}
                className="connect-button"
              >
                {isLoading ? '连接中...' : '连接钱包'}
              </button>
            ) : (
              <div className="wallet-info">
                <div className="account-info">
                  <span className="account-label">账户:</span>
                  <span className="account-address">{formatAddress(account)}</span>
                </div>
                <div className="network-info">
                  <span className="network-label">网络:</span>
                  <span className={`network-status ${isCorrectNetwork ? 'correct' : 'incorrect'}`}>
                    {isCorrectNetwork ? 'Anvil Local' : `Chain ID: ${chainId}`}
                  </span>
                </div>
                <div className="button-group">
                  {!isCorrectNetwork && (
                    <button 
                      onClick={switchToLocalNetwork}
                      className="switch-network-button"
                    >
                      切换到本地网络
                    </button>
                  )}
                  <button 
                    onClick={disconnect}
                    className="disconnect-button"
                  >
                    断开连接
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-section">
            <h2>欢迎使用 BeefDex</h2>
            <p>请连接你的钱包开始使用去中心化交易所。</p>
            <div className="features">
              <div className="feature">
                <h3>🔄 代币交换</h3>
                <p>在 WETH 和 USDC 之间进行无缝交换</p>
              </div>
              <div className="feature">
                <h3>💧 流动性提供</h3>
                <p>为交易对提供流动性并获得收益</p>
              </div>
              <div className="feature">
                <h3>⚡ 基于 Uniswap V3</h3>
                <p>享受集中流动性带来的高效交易</p>
              </div>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="network-warning">
            <h2>⚠️ 网络错误</h2>
            <p>请切换到 Anvil 本地网络 (Chain ID: 31337) 来使用 BeefDex。</p>
            <button 
              onClick={switchToLocalNetwork}
              className="switch-network-button"
            >
              切换到本地网络
            </button>
          </div>
        ) : (
          <div className="dex-interface">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                onClick={() => setActiveTab('swap')}
                className={`tab-button ${activeTab === 'swap' ? 'active' : ''}`}
              >
                💱 交换
              </button>
              <button
                onClick={() => setActiveTab('liquidity')}
                className={`tab-button ${activeTab === 'liquidity' ? 'active' : ''}`}
              >
                💧 流动性
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'swap' && (
                <SwapComponent 
                  signer={signer} 
                  account={account} 
                />
              )}
              {activeTab === 'liquidity' && (
                <LiquidityManager 
                  signer={signer} 
                  account={account} 
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 BeefDex. 基于 Uniswap V3 构建的演示项目。</p>
          <p className="disclaimer">
            ⚠️ 这是一个演示项目，仅用于学习目的，请勿在生产环境中使用。
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
