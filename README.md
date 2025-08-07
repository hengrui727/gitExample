# EMR Serverless StarRocks MCP Server

这是一个为阿里云EMR Serverless StarRocks设计的Model Context Protocol (MCP) 服务器，允许AI助手通过标准化的接口与StarRocks数据库进行交互。

## 功能特性

- 🔍 **集群管理**: 获取集群信息、监控指标
- 🗄️ **数据库操作**: 创建、删除、列出数据库
- 📊 **表管理**: 创建、删除、查询表结构和数据
- 🔍 **SQL查询**: 执行自定义SQL查询
- 👥 **用户管理**: 创建和管理用户账户
- 📈 **监控指标**: 获取集群性能指标

## 安装

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd emr-starrocks-mcp
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的阿里云配置：

```env
# 阿里云EMR Serverless StarRocks配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_REGION=cn-hangzhou

# StarRocks集群配置
STARROCKS_CLUSTER_ID=your_cluster_id
STARROCKS_ENDPOINT=https://your-cluster-endpoint.emrserverless.cn
STARROCKS_USERNAME=your_username
STARROCKS_PASSWORD=your_password

# MCP服务器配置
MCP_SERVER_PORT=3000
```

## 构建和运行

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm run build
npm start
```

## 可用的工具

### 集群管理
- `get_cluster_info`: 获取EMR Serverless StarRocks集群信息
- `get_cluster_metrics`: 获取集群监控指标

### 数据库操作
- `list_databases`: 列出所有数据库
- `create_database`: 创建新数据库
- `drop_database`: 删除数据库

### 表操作
- `list_tables`: 列出指定数据库中的所有表
- `get_table_info`: 获取表详细信息
- `create_table`: 创建新表
- `drop_table`: 删除表

### 查询操作
- `execute_query`: 执行SQL查询

### 用户管理
- `list_users`: 列出所有用户
- `create_user`: 创建新用户

## 使用示例

### 在Claude Desktop中配置

1. 打开Claude Desktop设置
2. 在MCP服务器配置中添加：

```json
{
  "mcpServers": {
    "emr-starrocks": {
      "command": "node",
      "args": ["/path/to/emr-starrocks-mcp/dist/index.js"],
      "env": {
        "ALIYUN_ACCESS_KEY_ID": "your_access_key_id",
        "ALIYUN_ACCESS_KEY_SECRET": "your_access_key_secret",
        "ALIYUN_REGION": "cn-hangzhou",
        "STARROCKS_CLUSTER_ID": "your_cluster_id",
        "STARROCKS_ENDPOINT": "https://your-cluster-endpoint.emrserverless.cn",
        "STARROCKS_USERNAME": "your_username",
        "STARROCKS_PASSWORD": "your_password"
      }
    }
  }
}
```

### 使用示例

配置完成后，你可以向Claude询问：

- "列出所有数据库"
- "在test_db数据库中创建一个名为users的表"
- "执行查询：SELECT * FROM test_db.users LIMIT 10"
- "获取集群状态信息"

## 开发

### 项目结构

```
src/
├── index.ts              # 主入口文件
├── mcp-server.ts         # MCP服务器实现
├── services/
│   ├── aliyun-emr-client.ts  # 阿里云EMR API客户端
│   └── starrocks-client.ts   # StarRocks直接连接客户端
└── types/
    └── starrocks.ts      # TypeScript类型定义
```

### 添加新工具

1. 在 `src/mcp-server.ts` 的 `setupTools()` 方法中添加工具定义
2. 在 `CallToolRequestSchema` 处理器中添加对应的case
3. 在相应的客户端类中实现具体功能

## 注意事项

1. **安全性**: 确保妥善保管阿里云访问密钥，不要将其提交到版本控制系统
2. **权限**: 确保使用的阿里云账户具有足够的EMR Serverless权限
3. **网络**: 确保服务器能够访问阿里云EMR API和StarRocks集群
4. **签名**: 当前实现使用简化的API签名，生产环境需要完整的阿里云签名算法

## 故障排除

### 常见问题

1. **连接失败**: 检查网络连接和防火墙设置
2. **认证错误**: 验证阿里云访问密钥是否正确
3. **权限不足**: 确认账户具有EMR Serverless管理权限
4. **集群不可用**: 检查StarRocks集群状态

### 调试

启用详细日志：

```bash
DEBUG=* npm run dev
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。