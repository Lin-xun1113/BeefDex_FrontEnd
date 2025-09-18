# BeefDex Frontend

基于 React 和 Ethers.js 构建的去中心化交易所前端界面，与你的 UniswapV3 合约集成。

## 功能特性

- 🔌 **钱包连接** - 支持 MetaMask 连接和网络切换
- 💱 **代币交换** - 在 WETH 和 USDC 之间进行交换
- 💧 **流动性管理** - 添加和管理流动性池
- 🎨 **美观界面** - 现代化的响应式设计
- ⚡ **实时更新** - 自动更新余额和交易状态

## 快速开始

### 1. 安装依赖

```bash
cd /home/linxun/Coding/Defi/BeefDex/FrontEnd
npm install
```

### 2. 配置合约地址

编辑 `src/contracts.js` 文件，更新合约地址为你实际部署的地址：

```javascript
export const CONTRACTS = {
  POOL: "你的Pool合约地址",
  MANAGER: "你的Manager合约地址", 
  TOKEN0: "WETH代币地址",
  TOKEN1: "USDC代币地址",
};
```

### 3. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动。

## 使用说明

### 连接钱包

1. 点击"连接钱包"按钮
2. 在 MetaMask 中确认连接
3. 如果不在正确网络，点击"切换到本地网络"

### 交换代币

1. 在"交换"标签页中
2. 选择交换方向（USDC → WETH 或 WETH → USDC）
3. 输入交换数量
4. 点击"交换"按钮确认

### 添加流动性

1. 在"流动性"标签页中
2. 首先点击"铸造测试代币"获取代币
3. 设置 tick 范围和流动性数量
4. 点击"添加流动性"

## 项目结构

```
src/
├── components/          # React 组件
│   ├── LiquidityManager.js
│   └── SwapComponent.js
├── hooks/              # 自定义 Hooks
│   └── useWeb3.js
├── contracts.js        # 合约配置和 ABI
├── App.js             # 主应用组件
├── App.css            # 样式文件
└── index.js           # 入口文件
```

## 重要说明

⚠️ **这是一个演示项目**，仅用于学习目的：

- 使用硬编码的交换汇率（实际项目应基于 AMM 算法）
- 合约地址需要根据实际部署更新
- 建议仅在测试网络使用

## 技术栈

- **React** - 前端框架
- **Ethers.js** - 以太坊交互库
- **MetaMask** - 钱包连接
- **CSS3** - 样式设计

## 开发

### 可用脚本

- `npm start` - 启动开发服务器
- `npm build` - 构建生产版本
- `npm test` - 运行测试
- `npm eject` - 弹出 CRA 配置

### 自定义配置

你可以修改以下文件来自定义应用：

- `src/contracts.js` - 合约配置
- `src/App.css` - 样式设计
- `src/hooks/useWeb3.js` - Web3 连接逻辑

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 确保安装了 MetaMask
   - 检查网络连接

2. **交易失败**
   - 确保有足够的代币余额
   - 检查合约地址是否正确

3. **网络错误**
   - 确保连接到正确的网络 (Chain ID: 31337)
   - 检查本地区块链是否运行

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
