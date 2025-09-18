import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, POOL_ABI, MANAGER_ABI, ERC20_ABI, TOKENS } from '../contracts';

const LiquidityManager = ({ signer, account }) => {
  const [lowerTick, setLowerTick] = useState('84222');
  const [upperTick, setUpperTick] = useState('86129');
  const [liquidity, setLiquidity] = useState('1517882343751509868544');
  const [tokenBalances, setTokenBalances] = useState({ weth: '0', usdc: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // 获取代币余额
  const getTokenBalances = async () => {
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
  };

  // 铸造测试代币
  const mintTestTokens = async () => {
    if (!signer || !account) return;

    try {
      setIsLoading(true);
      const wethContract = new ethers.Contract(TOKENS.WETH.address, ERC20_ABI, signer);
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, signer);

      console.log('正在铸造测试代币...');
      
      const wethTx = await wethContract.mint(account, ethers.utils.parseEther('10'));
      const usdcTx = await usdcContract.mint(account, ethers.utils.parseEther('50000'));

      await wethTx.wait();
      await usdcTx.wait();

      console.log('测试代币铸造完成');
      await getTokenBalances();
    } catch (error) {
      console.error('铸造测试代币失败:', error);
      alert('铸造测试代币失败: ' + error.message);
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

      // 准备回调数据
      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address'],
        [TOKENS.WETH.address, TOKENS.USDC.address, account]
      );

      // 预计算需要的代币数量 (这里使用固定值，实际应该计算)
      const amount0 = ethers.utils.parseEther('0.998976618347425280');
      const amount1 = ethers.utils.parseEther('5000');

      console.log('正在授权代币...');
      
      // 授权Manager合约使用代币
      const approveTx1 = await wethContract.approve(CONTRACTS.MANAGER, amount0);
      await approveTx1.wait();
      
      const approveTx2 = await usdcContract.approve(CONTRACTS.MANAGER, amount1);
      await approveTx2.wait();

      console.log('正在添加流动性...');

      // 调用Manager的mint函数
      const tx = await managerContract.mint(
        CONTRACTS.POOL,
        lowerTick,
        upperTick,
        liquidity,
        callbackData
      );

      setTxHash(tx.hash);
      console.log('交易已提交:', tx.hash);

      const receipt = await tx.wait();
      console.log('流动性添加成功!', receipt);

      // 更新余额
      await getTokenBalances();
      alert('流动性添加成功!');

    } catch (error) {
      console.error('添加流动性失败:', error);
      alert('添加流动性失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取池子信息
  const getPoolInfo = async () => {
    if (!signer) return;

    try {
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, signer);
      
      const [sqrtPriceX96, tick] = await poolContract.slot0();
      const currentLiquidity = await poolContract.liquidity();
      
      console.log('当前价格 (sqrtPriceX96):', sqrtPriceX96.toString());
      console.log('当前 tick:', tick.toString());
      console.log('当前流动性:', currentLiquidity.toString());
      
    } catch (error) {
      console.error('获取池子信息失败:', error);
    }
  };

  useEffect(() => {
    if (signer && account) {
      getTokenBalances();
      getPoolInfo();
    }
  }, [signer, account]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>流动性管理</h2>
      
      {/* 代币余额 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>代币余额</h3>
        <p>WETH: {parseFloat(tokenBalances.weth).toFixed(4)}</p>
        <p>USDC: {parseFloat(tokenBalances.usdc).toFixed(2)}</p>
        <button 
          onClick={mintTestTokens} 
          disabled={isLoading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '铸造中...' : '铸造测试代币'}
        </button>
      </div>

      {/* 添加流动性表单 */}
      <div>
        <h3>添加流动性</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            下边界 Tick:
            <input
              type="text"
              value={lowerTick}
              onChange={(e) => setLowerTick(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            上边界 Tick:
            <input
              type="text"
              value={upperTick}
              onChange={(e) => setUpperTick(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>
            流动性数量:
            <input
              type="text"
              value={liquidity}
              onChange={(e) => setLiquidity(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
            />
          </label>
        </div>
        
        <button
          onClick={addLiquidity}
          disabled={isLoading || !signer || !account}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '添加中...' : '添加流动性'}
        </button>

        {txHash && (
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            <p>交易哈希: <code>{txHash}</code></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityManager;
