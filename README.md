# BeefDex Frontend 🥩⚡

基于 Uniswap V3 架构的专业级去中心化交易所前端界面，提供完整的 AMM 交易和流动性管理体验。

## ✨ 功能特性

### 🔗 核心功能
- 🔌 **智能钱包连接** - MetaMask 集成，自动网络检测与切换
- 💱 **双向代币交换** - WETH ↔ USDC 实时交易，集成 Quoter 报价
- 💧 **专业流动性管理** - 精确 tick 范围控制，支持 concentrated liquidity
- 📊 **实时价格显示** - 当前池价格、交换汇率、价格影响计算
- 🎯 **交易预览** - 实时报价、滑点保护、交易确认

### 🎨 用户体验
- 🌙 **现代暗色主题** - 专业级 DeFi 界面设计
- 📱 **响应式设计** - 支持桌面和移动设备
- ⚡ **实时数据更新** - 自动刷新余额、价格和流动性状态
- 🔔 **交易状态跟踪** - 详细的交易进度和结果显示
- 🎭 **玻璃态效果** - 现代化视觉效果和动画

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动本地区块链

确保 Anvil 本地节点正在运行：

```bash
# 在 Contract 目录下
anvil
```

### 3. 部署合约（如需要）

```bash
# 在 Contract 目录下
forge script script/DeployDevelopment.sol --rpc-url http://localhost:8545 --private-key XXX --broadcast
```

### 4. 配置合约地址

合约地址在 `src/contracts.js` 中配置，当前配置：

```javascript
export const CONTRACTS = {
  POOL: "0x04C89607413713Ec9775E14b954286519d836FEf",
  MANAGER: "0x4C4a2f8c81640e47606d3fd77B353E87Ba015584", 
  QUOTER: "0x21dF544947ba3E8b3c32561399E88B52Dc8b2823",
  TOKEN0: "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d", // WETH
  TOKEN1: "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6", // USDC
};
```

### 5. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动。

## 📖 使用指南

### 💼 连接钱包

1. 点击"连接钱包"按钮
2. 在 MetaMask 中确认连接请求
3. 确保连接到 Anvil 本地网络 (Chain ID: 31337)
4. 如果网络不正确，点击"切换到本地网络"

### 🔄 代币交换

1. 切换到"交换"标签页
2. 使用方向切换按钮选择交换方向（WETH ↔ USDC）
3. 输入交换数量，系统将自动显示：
   - 实时报价
   - 交换汇率
   - 价格影响
4. 点击"交换"确认交易

### 💧 流动性管理

1. 切换到"流动性"标签页
2. **获取测试代币**：点击"铸造测试代币"获取 1000 WETH 和 5,000,000 USDC
3. **设置流动性参数**：
   - Lower Tick: 价格下限（例如：84222）
   - Upper Tick: 价格上限（例如：86129）
   - 流动性数量（点击"自动计算"获取安全值）
4. 点击"添加流动性"完成操作

### 🎛️ 高级功能

- **实时价格监控**：实时显示池子当前价格
- **价格影响计算**：自动计算并显示交易对价格的影响
- **精确tick管理**：支持精确的流动性范围设置
- **交易历史**：查看交易哈希和详细信息

## 📁 项目架构

```
src/
├── components/                 # React 组件
│   ├── LiquidityManagerNew.js # 流动性管理组件
│   ├── LiquidityManager.css   # 流动性管理样式
│   ├── SwapComponentNew.js    # 交换组件
│   └── SwapComponent.css      # 交换组件样式
├── hooks/                     # 自定义 Hooks
│   └── useWeb3.js            # Web3 连接逻辑
├── contracts.js              # 合约配置和完整 ABI
├── App.js                    # 主应用组件
├── App.css                   # 全局样式和主题
└── index.js                  # 应用入口点
```

## 🏗️ 合约架构

BeefDex 基于 Uniswap V3 架构，包含以下核心合约：

### 主要合约
- **UniswapV3Pool** - 核心 AMM 池合约，处理交换和流动性
- **UniswapV3Manager** - 管理合约，提供高级接口
- **UniswapV3Quoter** - 报价合约，提供实时价格计算
- **ERC20Mintable** - 可铸造的测试代币（WETH/USDC）

### 支持库
- **Math** - 数学计算库（避免溢出）
- **Tick** - Tick 操作库
- **Position** - 流动性位置管理
- **TickBitmap** - Tick 位图优化

## ⚠️ 重要说明

### 🎯 项目定位
这是一个基于 **Uniswap V3 架构的完整 DeFi 项目**，包含：
- ✅ 真实的 AMM 算法实现
- ✅ Concentrated Liquidity 支持
- ✅ 实时报价和价格影响计算
- ✅ 专业级用户界面

### 🔒 安全提醒
- 🚨 **仅用于学习和测试目的**
- 🚨 **请勿在主网使用**
- 🚨 **合约未经审计**
- 🚨 **建议仅在本地测试网络使用**

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **Ethers.js v5** - 以太坊交互库
- **CSS3** - 现代化样式设计
- **ES6+** - 最新 JavaScript 特性

### 区块链技术
- **Solidity 0.8.29** - 智能合约语言
- **Foundry** - 开发框架
- **OpenZeppelin** - 安全合约库
- **Anvil** - 本地测试网络

## 🔧 开发指南

### 📋 可用脚本

```bash
# 开发相关
npm start          # 启动开发服务器（热重载）
npm run build      # 构建生产版本
npm test           # 运行测试套件
npm run lint       # 代码检查

# 合约相关（在 Contract 目录下）
forge build        # 编译合约
forge test         # 运行合约测试
forge script...    # 部署合约
```

### ⚙️ 自定义配置

| 文件 | 功能 | 说明 |
|------|------|------|
| `src/contracts.js` | 合约配置 | 地址、ABI、网络配置 |
| `src/App.css` | 样式主题 | 暗色主题、组件样式 |
| `src/hooks/useWeb3.js` | Web3 逻辑 | 钱包连接、网络管理 |

### 🎨 主题定制

BeefDex 使用模块化 CSS 设计，支持：
- 🌙 暗色/亮色主题切换
- 🎭 玻璃态效果
- 📱 响应式布局
- 🎯 组件级样式隔离

## 🐛 故障排除

### 常见问题解决

#### 💸 代币相关
```bash
# 问题：余额不足
# 解决：点击"铸造测试代币"或增加铸造数量
```

#### 🔗 连接问题
```bash
# 问题：钱包连接失败
# 解决：
1. 确保安装 MetaMask 扩展
2. 检查是否允许网站访问钱包
3. 尝试刷新页面重新连接
```

#### 🌐 网络问题
```bash
# 问题：网络错误 (Chain ID: 31337)
# 解决：
1. 确保 Anvil 正在运行：anvil
2. 在 MetaMask 中添加本地网络
3. 检查 RPC URL: http://localhost:8545
```

#### 📊 交易失败
```bash
# 问题：Gas 估算失败或交易 revert
# 解决：
1. 检查代币授权是否足够
2. 确保流动性数量不会溢出
3. 检查合约地址是否正确
4. 查看浏览器控制台错误信息
```

### 🔍 调试技巧

1. **开启浏览器控制台**：查看详细错误和交易日志
2. **检查网络状态**：确认连接到正确的网络
3. **验证合约地址**：确保使用最新部署的合约地址
4. **监控 Gas 使用**：大数值操作可能需要更多 Gas

## 🚀 部署指南

### 测试网部署
```bash
# 1. 修改网络配置
# 2. 更新合约地址
# 3. 构建生产版本
npm run build
```

### 主网部署
⚠️ **强烈建议先进行完整的安全审计**

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践
- 编写清晰的注释和文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢 Uniswap 团队的开源贡献，本项目基于 Uniswap V3 架构构建。

---

**⚡ BeefDex - 让 DeFi 交易更简单！** 🥩
