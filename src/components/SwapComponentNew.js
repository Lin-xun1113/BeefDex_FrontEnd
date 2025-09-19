import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, POOL_ABI, MANAGER_ABI, ERC20_ABI, QUOTER_ABI, TOKENS } from '../contracts';
import './SwapComponent.css';

const SwapComponent = ({ signer, account }) => {
  const [swapAmount, setSwapAmount] = useState('');
  const [tokenBalances, setTokenBalances] = useState({ weth: '0', usdc: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [swapDirection, setSwapDirection] = useState('WETH_TO_USDC');
  const [quoteResult, setQuoteResult] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [poolPrice, setPoolPrice] = useState(null);
  const [showTxDetails, setShowTxDetails] = useState(false);

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

  // 获取当前池子价格
  const getPoolPrice = useCallback(async () => {
    if (!signer) return;
    
    try {
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, signer);
      const slot0 = await poolContract.slot0();
      const sqrtPriceX96 = slot0.sqrtPriceX96;
      
      const sqrtPrice = parseFloat(sqrtPriceX96.toString()) / (2 ** 96);
      const price = sqrtPrice * sqrtPrice;
      
      setPoolPrice(price);
    } catch (error) {
      console.error('获取池子价格失败:', error);
    }
  }, [signer]);

  // 获取交换报价
  const getQuote = useCallback(async (amount) => {
    if (!signer || !amount || parseFloat(amount) <= 0) {
      setQuoteResult(null);
      return;
    }

    setIsQuoting(true);
    try {
      const quoterContract = new ethers.Contract(CONTRACTS.QUOTER, QUOTER_ABI, signer);
      const amountIn = ethers.utils.parseEther(amount);
      
      const quoteParams = {
        pool: CONTRACTS.POOL,
        amountIn: amountIn,
        zeroForOne: swapDirection === 'WETH_TO_USDC'
      };

      const result = await quoterContract.callStatic.quote(quoteParams);
      
      setQuoteResult({
        amountOut: result.amountOut,
        sqrtPriceX96After: result.sqrtPriceX96After,
        tickAfter: result.tickAfter
      });
    } catch (error) {
      console.error('获取报价失败:', error);
      setQuoteResult(null);
      
      if (error.errorArgs) {
        try {
          setQuoteResult({
            amountOut: error.errorArgs[0],
            sqrtPriceX96After: error.errorArgs[1],
            tickAfter: error.errorArgs[2]
          });
        } catch (parseError) {
          console.error('解析报价结果失败:', parseError);
        }
      }
    } finally {
      setIsQuoting(false);
    }
  }, [signer, swapDirection]);

  // 执行交换
  const executeSwap = async () => {
    if (!signer || !account || !swapAmount) return;

    try {
      setIsLoading(true);
      setTxHash('');

      const managerContract = new ethers.Contract(CONTRACTS.MANAGER, MANAGER_ABI, signer);
      const wethContract = new ethers.Contract(TOKENS.WETH.address, ERC20_ABI, signer);
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, signer);

      const callbackData = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address'],
        [TOKENS.WETH.address, TOKENS.USDC.address, account]
      );

      const amount = ethers.utils.parseEther(swapAmount);
      const zeroForOne = swapDirection === 'WETH_TO_USDC';

      // 授权
      if (swapDirection === 'WETH_TO_USDC') {
        const approveTx = await wethContract.approve(CONTRACTS.MANAGER, amount);
        await approveTx.wait();
      } else {
        const approveTx = await usdcContract.approve(CONTRACTS.MANAGER, amount);
        await approveTx.wait();
      }

      // 执行交换
      const tx = await managerContract.swap(
        CONTRACTS.POOL,
        zeroForOne,
        amount,
        callbackData
      );

      setTxHash(tx.hash);
      setShowTxDetails(true);

      const receipt = await tx.wait();
      console.log('交换成功!', receipt);

      await getTokenBalances();
      await getPoolPrice();
      
    } catch (error) {
      console.error('交换失败:', error);
      alert('交换失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSwapAmount(value);
    }
  };

  // 处理方向切换
  const handleDirectionSwitch = () => {
    setSwapDirection(prev => prev === 'WETH_TO_USDC' ? 'USDC_TO_WETH' : 'WETH_TO_USDC');
    setQuoteResult(null);
  };

  // 格式化输出数量
  const formatOutputAmount = () => {
    if (!quoteResult || !quoteResult.amountOut) return '0';
    const amountOut = ethers.utils.formatEther(quoteResult.amountOut);
    return parseFloat(amountOut).toFixed(6);
  };

  // 计算价格影响
  const calculatePriceImpact = () => {
    if (!quoteResult || !poolPrice || !swapAmount) return null;
    
    const amountIn = parseFloat(swapAmount);
    const amountOut = parseFloat(formatOutputAmount());
    
    if (swapDirection === 'WETH_TO_USDC') {
      const expectedOut = amountIn * poolPrice;
      const impact = ((expectedOut - amountOut) / expectedOut) * 100;
      return Math.abs(impact).toFixed(2);
    } else {
      const expectedOut = amountIn / poolPrice;
      const impact = ((expectedOut - amountOut) / expectedOut) * 100;
      return Math.abs(impact).toFixed(2);
    }
  };

  // 初始化
  useEffect(() => {
    if (signer && account) {
      getTokenBalances();
      getPoolPrice();
    }
  }, [signer, account, getTokenBalances, getPoolPrice]);

  // 获取报价
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (swapAmount) {
        getQuote(swapAmount);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [swapAmount, swapDirection, getQuote]);

  const priceImpact = calculatePriceImpact();
  const inputToken = swapDirection === 'WETH_TO_USDC' ? 'WETH' : 'USDC';
  const outputToken = swapDirection === 'WETH_TO_USDC' ? 'USDC' : 'WETH';

  return (
    <div className="swap-container">
      <div className="swap-card">
        <div className="swap-header">
          <h2>兑换</h2>
          <button className="settings-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12.5C11.38 12.5 12.5 11.38 12.5 10C12.5 8.62 11.38 7.5 10 7.5C8.62 7.5 7.5 8.62 7.5 10C7.5 11.38 8.62 12.5 10 12.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16.167 12.5C16.037 12.773 16.017 13.083 16.108 13.369C16.199 13.656 16.397 13.898 16.667 14.05L16.717 14.083C16.927 14.201 17.103 14.369 17.229 14.572C17.355 14.775 17.428 15.006 17.441 15.244C17.454 15.482 17.406 15.720 17.302 15.936C17.198 16.152 17.041 16.338 16.846 16.479L16.667 16.604C16.472 16.745 16.244 16.837 16.004 16.871C15.764 16.906 15.519 16.882 15.291 16.802C15.063 16.722 14.858 16.588 14.694 16.411C14.530 16.235 14.412 16.021 14.35 15.788C14.266 15.498 14.078 15.248 13.820 15.082C13.562 14.917 13.250 14.847 12.938 14.885C12.626 14.923 12.334 15.068 12.110 15.295C11.886 15.523 11.743 15.821 11.704 16.143L11.692 16.250C11.653 16.572 11.509 16.870 11.283 17.098C11.057 17.325 10.760 17.469 10.438 17.508C10.116 17.547 9.787 17.478 9.507 17.313C9.227 17.147 9.011 16.894 8.892 16.594L8.833 16.450C8.681 16.119 8.419 15.848 8.087 15.681C7.756 15.515 7.375 15.463 7.008 15.533C6.641 15.604 6.310 15.793 6.067 16.069C5.824 16.345 5.683 16.693 5.667 17.058V17.083C5.651 17.448 5.510 17.796 5.267 18.072C5.024 18.349 4.693 18.537 4.325 18.604C3.957 18.672 3.574 18.615 3.243 18.443C2.912 18.270 2.652 17.992 2.504 17.654L2.450 17.533C2.302 17.195 2.040 16.917 1.708 16.744C1.377 16.571 0.996 16.514 0.629 16.581C0.262 16.648 -0.070 16.837 -0.313 17.116C-0.557 17.394 -0.698 17.746 -0.717 18.117V18.167C-0.735 18.538 -0.876 18.890 -1.119 19.169C-1.362 19.447 -1.693 19.636 -2.061 19.703C-2.429 19.771 -2.812 19.714 -3.143 19.541C-3.474 19.369 -3.734 19.091 -3.883 18.753L-3.933 18.633C-4.081 18.295 -4.343 18.017 -4.674 17.844C-5.006 17.671 -5.387 17.614 -5.754 17.681C-6.121 17.748 -6.452 17.937 -6.695 18.216C-6.938 18.494 -7.079 18.846 -7.095 19.211V19.250C-7.111 19.615 -7.252 19.963 -7.495 20.239C-7.738 20.516 -8.069 20.704 -8.437 20.772C-8.805 20.839 -9.188 20.782 -9.519 20.610C-9.850 20.437 -10.110 20.159 -10.258 19.821L-10.317 19.683C-10.465 19.345 -10.727 19.067 -11.058 18.894C-11.390 18.721 -11.771 18.664 -12.138 18.731C-12.505 18.798 -12.836 18.987 -13.079 19.266C-13.322 19.544 -13.463 19.896 -13.479 20.261V20.333C-13.495 20.698 -13.636 21.046 -13.879 21.322C-14.122 21.599 -14.453 21.787 -14.821 21.855C-15.189 21.922 -15.572 21.865 -15.903 21.693C-16.234 21.520 -16.494 21.242 -16.642 20.904L-16.700 20.767C-16.848 20.429 -17.110 20.151 -17.441 19.978C-17.773 19.805 -18.154 19.748 -18.521 19.815C-18.888 19.882 -19.219 20.071 -19.462 20.350C-19.705 20.628 -19.846 20.980 -19.862 21.345V21.417C-19.878 21.782 -20.019 22.130 -20.262 22.406C-20.505 22.683 -20.836 22.871 -21.204 22.939C-21.572 23.006 -21.955 22.949 -22.286 22.777C-22.617 22.604 -22.877 22.326 -23.025 21.988L-23.083 21.850C-23.231 21.512 -23.493 21.234 -23.824 21.061C-24.156 20.888 -24.537 20.831 -24.904 20.898C-25.271 20.965 -25.602 21.154 -25.845 21.433C-26.088 21.711 -26.229 22.063 -26.245 22.428V22.500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="swap-body">
          {/* 输入部分 */}
          <div className="swap-input-container">
            <div className="swap-input-header">
              <span className="swap-input-label">你支付</span>
              <span className="swap-balance">
                余额: {inputToken === 'WETH' 
                  ? parseFloat(tokenBalances.weth).toFixed(6) 
                  : parseFloat(tokenBalances.usdc).toFixed(2)}
              </span>
            </div>
            <div className="swap-input-wrapper">
              <input
                type="text"
                className="swap-input"
                placeholder="0.0"
                value={swapAmount}
                onChange={handleAmountChange}
                disabled={isLoading}
              />
              <button className="token-selector">
                <div className="token-info">
                  <div className="token-icon">
                    {inputToken === 'WETH' ? '⟠' : '$'}
                  </div>
                  <span className="token-symbol">{inputToken}</span>
                </div>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="swap-direction-wrapper">
            <button className="swap-direction-btn" onClick={handleDirectionSwitch}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M10 17L6 13M10 17L14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* 输出部分 */}
          <div className="swap-input-container">
            <div className="swap-input-header">
              <span className="swap-input-label">你将收到</span>
              <span className="swap-balance">
                余额: {outputToken === 'WETH' 
                  ? parseFloat(tokenBalances.weth).toFixed(6) 
                  : parseFloat(tokenBalances.usdc).toFixed(2)}
              </span>
            </div>
            <div className="swap-input-wrapper">
              <input
                type="text"
                className="swap-input"
                placeholder="0.0"
                value={isQuoting ? '计算中...' : formatOutputAmount()}
                readOnly
                disabled
              />
              <button className="token-selector">
                <div className="token-info">
                  <div className="token-icon">
                    {outputToken === 'WETH' ? '⟠' : '$'}
                  </div>
                  <span className="token-symbol">{outputToken}</span>
                </div>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 交易详情 */}
          {quoteResult && swapAmount && (
            <div className="swap-details">
              <div className="swap-detail-row">
                <span>汇率</span>
                <span>
                  1 {inputToken} = {' '}
                  {(parseFloat(formatOutputAmount()) / parseFloat(swapAmount) || 0).toFixed(4)} {outputToken}
                </span>
              </div>
              {priceImpact && (
                <div className="swap-detail-row">
                  <span>价格影响</span>
                  <span className={`price-impact ${parseFloat(priceImpact) > 5 ? 'high' : parseFloat(priceImpact) > 2 ? 'medium' : 'low'}`}>
                    {priceImpact}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 交换按钮 */}
          <button
            className={`swap-btn ${!quoteResult || !swapAmount ? 'disabled' : ''}`}
            onClick={executeSwap}
            disabled={isLoading || !signer || !account || !swapAmount || !quoteResult}
          >
            {isLoading ? (
              <span className="loading">交易处理中...</span>
            ) : !signer || !account ? (
              '请连接钱包'
            ) : !swapAmount ? (
              '输入数量'
            ) : !quoteResult ? (
              '输入有效数量'
            ) : (
              '兑换'
            )}
          </button>

          {/* 交易哈希 */}
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
    </div>
  );
};

export default SwapComponent;
