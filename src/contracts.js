// 合约地址 - 需要根据实际部署的地址修改
export const CONTRACTS = {
  // 这些地址需要在部署后更新
  POOL: "0x04C89607413713Ec9775E14b954286519d836FEf", // 示例地址
  MANAGER: "0x4C4a2f8c81640e47606d3fd77B353E87Ba015584", // 示例地址
  QUOTER: "0x21dF544947ba3E8b3c32561399E88B52Dc8b2823", // Quoter 地址
  TOKEN0: "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d", // WETH 地址
  TOKEN1: "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6", // USDC 地址
};

// UniswapV3Pool ABI
export const POOL_ABI = [
  // 构造函数
  "constructor(address token0_, address token1_, uint160 sqrtPriceX96, int24 tick)",
  
  // 只读函数
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick)",
  "function liquidity() view returns (uint128)",
  "function positions(bytes32) view returns (uint128)",
  "function ticks(int24) view returns (bool initialized, uint128 liquidityGross)",
  
  // 写入函数
  "function mint(address owner, int24 lowerTick, int24 upperTick, uint128 amount, bytes calldata data) returns (uint256 amount0, uint256 amount1)",
  "function swap(address recipient, bool zeroForOne, uint256 amountSpecified, bytes calldata data) returns (int256 amount0, int256 amount1)",
  
  // 事件
  "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
];

// UniswapV3Manager ABI
export const MANAGER_ABI = [
  "function mint(address poolAddress_, int24 lowerTick, int24 upperTick, uint128 liquidity, bytes calldata data)",
  "function swap(address poolAddress_, bool zeroForOne, uint256 amountIn, bytes calldata data)",
  "function uniswapV3MintCallback(uint256 amount0, uint256 amount1, bytes calldata data)",
  "function uniswapV3SwapCallback(int256 amount0, int256 amount1, bytes calldata data)"
];

// UniswapV3Quoter ABI
export const QUOTER_ABI = [
  "function quote((address pool, uint256 amountIn, bool zeroForOne)) view returns (uint256 amountOut, uint160 sqrtPriceX96After, int24 tickAfter)"
];

// ERC20 ABI
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  
  // Mintable 函数 (测试用)
  "function mint(address to, uint256 amount)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// 代币信息
export const TOKENS = {
  WETH: {
    address: CONTRACTS.TOKEN0,
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18
  },
  USDC: {
    address: CONTRACTS.TOKEN1,
    symbol: "USDC", 
    name: "USD Coin",
    decimals: 18 // 注意：在你的测试合约中是18位小数
  }
};

// 网络配置
export const NETWORK_CONFIG = {
  chainId: 31337, 
  chainName: "Anvil",
  rpcUrl: "http://localhost:8545"
};
