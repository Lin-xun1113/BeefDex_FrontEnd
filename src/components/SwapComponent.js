import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, POOL_ABI, MANAGER_ABI, ERC20_ABI, TOKENS } from '../contracts';

const SwapComponent = ({ signer, account }) => {
  const [swapAmount, setSwapAmount] = useState('42');
  const [tokenBalances, setTokenBalances] = useState({ weth: '0', usdc: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [swapDirection, setSwapDirection] = useState('USDC_TO_WETH'); // USDC_TO_WETH or WETH_TO_USDC

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

  // 执行交换
  const executeSwap = async () => {
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

      const amount = ethers.utils.parseEther(swapAmount);

      console.log(`正在交换 ${swapAmount} ${swapDirection === 'USDC_TO_WETH' ? 'USDC' : 'WETH'}...`);

      // 根据交换方向授权相应的代币
      if (swapDirection === 'USDC_TO_WETH') {
        // USDC -> WETH，需要授权USDC
        const approveTx = await usdcContract.approve(CONTRACTS.MANAGER, amount);
        await approveTx.wait();
        console.log('USDC 授权完成');
      } else {
        // WETH -> USDC，需要授权WETH
        const approveTx = await wethContract.approve(CONTRACTS.MANAGER, amount);
        await approveTx.wait();
        console.log('WETH 授权完成');
      }

      // 执行交换
      console.log('正在执行交换...');
      const tx = await managerContract.swap(CONTRACTS.POOL, callbackData);

      setTxHash(tx.hash);
      console.log('交易已提交:', tx.hash);

      const receipt = await tx.wait();
      console.log('交换成功!', receipt);

      // 更新余额
      await getTokenBalances();
      alert('交换成功!');

    } catch (error) {
      console.error('交换失败:', error);
      alert('交换失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取交换预览信息
  const getSwapPreview = () => {
    // 这里使用硬编码的值，实际项目中应该调用合约计算
    if (swapDirection === 'USDC_TO_WETH') {
      return {
        input: `${swapAmount} USDC`,
        output: `≈ 0.008396714242162444 WETH`
      };
    } else {
      return {
        input: `${swapAmount} WETH`,
        output: `≈ ${(parseFloat(swapAmount) * 5000).toFixed(2)} USDC` // 简化计算
      };
    }
  };

  useEffect(() => {
    if (signer && account) {
      getTokenBalances();
    }
  }, [signer, account]);

  const preview = getSwapPreview();

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>代币交换</h2>
      
      {/* 代币余额 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>可用余额</h3>
        <p>WETH: {parseFloat(tokenBalances.weth).toFixed(6)}</p>
        <p>USDC: {parseFloat(tokenBalances.usdc).toFixed(2)}</p>
      </div>

      {/* 交换方向选择 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>交换方向</h3>
        <div>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              value="USDC_TO_WETH"
              checked={swapDirection === 'USDC_TO_WETH'}
              onChange={(e) => setSwapDirection(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            USDC → WETH
          </label>
          <label>
            <input
              type="radio"
              value="WETH_TO_USDC"
              checked={swapDirection === 'WETH_TO_USDC'}
              onChange={(e) => setSwapDirection(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            WETH → USDC
          </label>
        </div>
      </div>

      {/* 交换表单 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>交换数量</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            数量:
            <input
              type="text"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="输入交换数量"
              style={{ 
                marginLeft: '10px', 
                padding: '8px', 
                width: '150px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
              {swapDirection === 'USDC_TO_WETH' ? 'USDC' : 'WETH'}
            </span>
          </label>
        </div>

        {/* 交换预览 */}
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <p><strong>交换预览:</strong></p>
          <p>输入: {preview.input}</p>
          <p>输出: {preview.output}</p>
        </div>

        <button
          onClick={executeSwap}
          disabled={isLoading || !signer || !account || !swapAmount}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !swapAmount ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isLoading ? '交换中...' : `交换 ${swapDirection === 'USDC_TO_WETH' ? 'USDC → WETH' : 'WETH → USDC'}`}
        </button>

        {txHash && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <p><strong>交易哈希:</strong></p>
            <p style={{ wordBreak: 'break-all' }}>{txHash}</p>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h4>使用说明:</h4>
        <ul>
          <li>确保你有足够的代币余额进行交换</li>
          <li>当前交换基于固定的汇率（仅用于演示）</li>
          <li>实际项目中应该基于 AMM 算法计算实时价格</li>
          <li>交换前会自动授权合约使用你的代币</li>
        </ul>
      </div>
    </div>
  );
};

export default SwapComponent;
