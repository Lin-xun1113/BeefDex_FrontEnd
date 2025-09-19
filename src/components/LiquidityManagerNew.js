import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, POOL_ABI, MANAGER_ABI, ERC20_ABI, TOKENS } from '../contracts';
import './LiquidityManager.css';

const LiquidityManager = ({ signer, account }) => {
  const [lowerTick, setLowerTick] = useState('84222');
  const [upperTick, setUpperTick] = useState('86129');
  const [liquidity, setLiquidity] = useState('1517882343751509868544');
  const [tokenBalances, setTokenBalances] = useState({ weth: '0', usdc: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showTxDetails, setShowTxDetails] = useState(false);
  const [poolInfo, setPoolInfo] = useState(null);

  // 获取代币余额
  const getTokenBalances = useCallback(async () => {
    if (!signer || !account) return;

    try {
      const wethContract = new ethers.Contract(TOKENS.WETH.address, ERC20_ABI, signer);
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, signer);

      const wethBalance = await wethContract.balanceOf(account);
      const usdcBalance = await usdcContract.balanceOf(account);

      setTokenBalances({
        weth: ethers.utils.formatEther(wethBalance),
        usdc: ethers.utils.formatEther(usdcBalance)
      });
    } catch (error) {
      console.error('获取代币余额失败:', error);
    }
  }, [signer, account]);

  // 获取池子信息
  const getPoolInfo = useCallback(async () => {
    if (!signer) return;

    try {
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, signer);
      
      const [sqrtPriceX96, tick] = await poolContract.slot0();
      const currentLiquidity = await poolContract.liquidity();
      
      // 计算价格
      const sqrtPrice = parseFloat(sqrtPriceX96.toString()) / (2 ** 96);
      const price = sqrtPrice * sqrtPrice;
      
      setPoolInfo({
        price: price,
        tick: tick.toString(),
        liquidity: currentLiquidity.toString(),
        sqrtPriceX96: sqrtPriceX96.toString()
      });
      
    } catch (error) {
      console.error('获取池子信息失败:', error);
    }
  }, [signer]);

  // 铸造测试代币
  const mintTestTokens = async () => {
    if (!signer || !account) return;

    try {
      setIsLoading(true);
      const wethContract = new ethers.Contract(TOKENS.WETH.address, ERC20_ABI, signer);
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, signer);

      console.log('正在铸造测试代币...');
      
      // 设置gas参数防止circuit breaker错误
      const gasOptions = {
        gasLimit: 200000,
        gasPrice: ethers.utils.parseUnits('2', 'gwei')
      };
      
      const wethTx = await wethContract.mint(account, ethers.utils.parseEther('1000'), gasOptions);
      console.log('WETH铸造交易已发送:', wethTx.hash);
      
      const usdcTx = await usdcContract.mint(account, ethers.utils.parseEther('5000000'), gasOptions);
      console.log('USDC铸造交易已发送:', usdcTx.hash);

      console.log('等待WETH铸造确认...');
      await wethTx.wait();
      console.log('等待USDC铸造确认...');
      await usdcTx.wait();

      console.log('测试代币铸造完成');
      await getTokenBalances();
      
    } catch (error) {
      console.error('铸造失败:', error);
      alert('铸造失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加流动性
  const addLiquidity = async () => {
    if (!signer || !account) return;

    try {
      setIsLoading(true);
      setTxHash('');

      // 创建合约实例
      const managerContract = new ethers.Contract(CONTRACTS.MANAGER, MANAGER_ABI, signer);
      const wethContract = new ethers.Contract(TOKENS.WETH.address, ERC20_ABI, signer);
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, signer);
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, signer);

      // 获取添加流动性前的状态
      console.log('=== 添加流动性前的状态 ===');
      const balancesBefore = {
        weth: await wethContract.balanceOf(account),
        usdc: await usdcContract.balanceOf(account)
      };
      const liquidityBefore = await poolContract.liquidity();
      console.log('WETH余额（添加前）:', ethers.utils.formatEther(balancesBefore.weth));
      console.log('USDC余额（添加前）:', ethers.utils.formatEther(balancesBefore.usdc));
      console.log('池子流动性（添加前）:', liquidityBefore.toString());

      // 准备回调数据
      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address'],
        [TOKENS.WETH.address, TOKENS.USDC.address, account]
      );

      // 预计算需要的代币数量
      const amount0 = ethers.utils.parseEther('100');
      const amount1 = ethers.utils.parseEther('500000');

      console.log('正在授权代币...');
      console.log('授权WETH数量:', ethers.utils.formatEther(amount0));
      console.log('授权USDC数量:', ethers.utils.formatEther(amount1));
      
      // 授权Manager合约使用代币
      const approveTx1 = await wethContract.approve(CONTRACTS.MANAGER, amount0);
      await approveTx1.wait();
      
      const approveTx2 = await usdcContract.approve(CONTRACTS.MANAGER, amount1);
      await approveTx2.wait();

      console.log('正在添加流动性...');
      console.log('参数:', {
        pool: CONTRACTS.POOL,
        lowerTick: parseInt(lowerTick),
        upperTick: parseInt(upperTick),
        liquidity: liquidity
      });

      // 调用Manager的mint函数 - 注意参数类型转换
      const gasOptions = {
        gasLimit: 500000,
        gasPrice: ethers.utils.parseUnits('2', 'gwei')
      };
      
      const tx = await managerContract.mint(
        CONTRACTS.POOL,
        parseInt(lowerTick),  // 转换为数字
        parseInt(upperTick),  // 转换为数字
        liquidity,
        callbackData,
        gasOptions
      );

      setTxHash(tx.hash);
      setShowTxDetails(true);
      console.log('交易已提交:', tx.hash);

      const receipt = await tx.wait();
      console.log('流动性添加成功!', receipt);

      // 检查交易事件
      console.log('=== 交易事件 ===');
      receipt.events?.forEach((event, index) => {
        console.log(`事件 ${index}:`, event.event, event.args);
      });

      // 获取添加流动性后的状态
      console.log('=== 添加流动性后的状态 ===');
      const balancesAfter = {
        weth: await wethContract.balanceOf(account),
        usdc: await usdcContract.balanceOf(account)
      };
      const liquidityAfter = await poolContract.liquidity();
      
      console.log('WETH余额（添加后）:', ethers.utils.formatEther(balancesAfter.weth));
      console.log('USDC余额（添加后）:', ethers.utils.formatEther(balancesAfter.usdc));
      console.log('池子流动性（添加后）:', liquidityAfter.toString());

      // 计算变化
      const wethChange = balancesBefore.weth.sub(balancesAfter.weth);
      const usdcChange = balancesBefore.usdc.sub(balancesAfter.usdc);
      const liquidityChange = liquidityAfter.sub(liquidityBefore);

      console.log('=== 变化量 ===');
      console.log('WETH变化:', ethers.utils.formatEther(wethChange));
      console.log('USDC变化:', ethers.utils.formatEther(usdcChange));
      console.log('流动性变化:', liquidityChange.toString());

      await getTokenBalances();
      await getPoolInfo();

    } catch (error) {
      console.error('添加流动性失败:', error);
      alert('添加流动性失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    if (signer && account) {
      getTokenBalances();
      getPoolInfo();
    }
  }, [signer, account, getTokenBalances, getPoolInfo]);

  return (
    <div className="liquidity-container">
      <div className="liquidity-card">
        <div className="liquidity-header">
          <h2>流动性管理</h2>
          <button className="refresh-btn" onClick={() => {
            getTokenBalances();
            getPoolInfo();
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10C4 13.314 6.686 16 10 16C12.389 16 14.5 14.657 15.534 12.656L14.024 11.932C13.368 13.229 11.802 14 10 14C7.791 14 6 12.209 6 10C6 7.791 7.791 6 10 6C11.802 6 13.368 6.771 14.024 8.068L15.534 7.344C14.5 5.343 12.389 4 10 4C6.686 4 4 6.686 4 10Z" fill="currentColor"/>
              <path d="M14 7V10H17L14 7Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* 池子信息 */}
        {poolInfo && (
          <div className="pool-info">
            <h3>池子信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">当前价格</span>
                <span className="info-value">1 WETH = {poolInfo.price.toFixed(2)} USDC</span>
              </div>
              <div className="info-item">
                <span className="info-label">当前 Tick</span>
                <span className="info-value">{poolInfo.tick}</span>
              </div>
              <div className="info-item">
                <span className="info-label">总流动性</span>
                <span className="info-value">{(parseFloat(poolInfo.liquidity) / 1e18).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 代币余额 */}
        <div className="balance-section">
          <h3>代币余额</h3>
          <div className="balance-grid">
            <div className="balance-item">
              <div className="token-icon weth">⟠</div>
              <div className="balance-info">
                <span className="token-name">WETH</span>
                <span className="token-balance">{parseFloat(tokenBalances.weth).toFixed(6)}</span>
              </div>
            </div>
            <div className="balance-item">
              <div className="token-icon usdc">$</div>
              <div className="balance-info">
                <span className="token-name">USDC</span>
                <span className="token-balance">{parseFloat(tokenBalances.usdc).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button 
            className="mint-btn"
            onClick={mintTestTokens} 
            disabled={isLoading}
          >
            {isLoading ? '铸造中...' : '铸造测试代币'}
          </button>
        </div>

        {/* 流动性参数 */}
        <div className="liquidity-params">
          <h3>流动性参数</h3>
          
          <div className="param-group">
            <label className="param-label">价格下限 (Lower Tick)</label>
            <input
              type="number"
              className="param-input"
              value={lowerTick}
              onChange={(e) => setLowerTick(e.target.value)}
              placeholder="例如: 84222"
            />
          </div>

          <div className="param-group">
            <label className="param-label">价格上限 (Upper Tick)</label>
            <input
              type="number"
              className="param-input"
              value={upperTick}
              onChange={(e) => setUpperTick(e.target.value)}
              placeholder="例如: 86129"
            />
          </div>

          <div className="param-group">
            <label className="param-label">流动性数量</label>
            <input
              type="text"
              className="param-input"
              value={liquidity}
              onChange={(e) => setLiquidity(e.target.value)}
              placeholder="流动性数量"
            />
          </div>

          <div className="price-range">
            <div className="price-item">
              <span className="price-label">最低价格</span>
              <span className="price-value">
                {Math.pow(1.0001, parseInt(lowerTick) || 0).toFixed(2)} USDC per WETH
              </span>
            </div>
            <div className="price-item">
              <span className="price-label">最高价格</span>
              <span className="price-value">
                {Math.pow(1.0001, parseInt(upperTick) || 0).toFixed(2)} USDC per WETH
              </span>
            </div>
          </div>
        </div>

        {/* 添加流动性按钮 */}
        <button
          className="add-liquidity-btn"
          onClick={addLiquidity}
          disabled={isLoading || !signer || !account}
        >
          {isLoading ? (
            <span className="loading">处理中...</span>
          ) : !signer || !account ? (
            '请连接钱包'
          ) : (
            '添加流动性'
          )}
        </button>

        {/* 交易详情 */}
        {txHash && showTxDetails && (
          <div className="tx-details">
            <div className="tx-header">
              <span>交易已提交</span>
              <button onClick={() => setShowTxDetails(false)}>×</button>
            </div>
            <a 
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              查看交易详情 →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityManager;
