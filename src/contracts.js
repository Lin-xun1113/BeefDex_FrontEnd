// 合约地址 - 需要根据实际部署的地址修改
export const CONTRACTS = {
  // 这些地址需要在部署后更新
  POOL: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // 示例地址
  MANAGER: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // 示例地址
  TOKEN0: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // WETH 地址
  TOKEN1: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // USDC 地址
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
  "function swap(address recipient, bytes calldata data) returns (int256 amount0, int256 amount1)",
  
  // 事件
  "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
];

// UniswapV3Manager ABI
export const MANAGER_ABI = [
  "function mint(address poolAddress_, int24 lowerTick, int24 upperTick, uint128 liquidity, bytes calldata data)",
  "function swap(address poolAddress_, bytes calldata data)",
  "function uniswapV3MintCallback(uint256 amount0, uint256 amount1, bytes calldata data)",
  "function uniswapV3SwapCallback(int256 amount0, int256 amount1, bytes calldata data)"
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
