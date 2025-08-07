# EMR Serverless StarRocks MCP API 文档

## 概述

这个MCP服务器提供了与阿里云EMR Serverless StarRocks集群交互的完整功能。支持数据库管理、表操作、SQL查询、用户管理等功能。

## 工具列表

### 1. 集群管理

#### get_cluster_info
获取EMR Serverless StarRocks集群信息

**参数**: 无

**返回**: 集群详细信息，包括状态、配置等

**示例**:
```json
{
  "name": "get_cluster_info",
  "arguments": {}
}
```

#### get_cluster_metrics
获取集群监控指标

**参数**: 无

**返回**: 集群性能指标，包括CPU、内存、存储使用情况

**示例**:
```json
{
  "name": "get_cluster_metrics",
  "arguments": {}
}
```

### 2. 数据库操作

#### list_databases
列出所有数据库

**参数**: 无

**返回**: 数据库名称列表

**示例**:
```json
{
  "name": "list_databases",
  "arguments": {}
}
```

#### create_database
创建新数据库

**参数**:
- `name` (string, 必需): 数据库名称
- `description` (string, 可选): 数据库描述

**示例**:
```json
{
  "name": "create_database",
  "arguments": {
    "name": "test_db",
    "description": "测试数据库"
  }
}
```

#### drop_database
删除数据库

**参数**:
- `name` (string, 必需): 数据库名称

**示例**:
```json
{
  "name": "drop_database",
  "arguments": {
    "name": "test_db"
  }
}
```

### 3. 表操作

#### list_tables
列出指定数据库中的所有表

**参数**:
- `database` (string, 必需): 数据库名称

**示例**:
```json
{
  "name": "list_tables",
  "arguments": {
    "database": "test_db"
  }
}
```

#### get_table_info
获取表详细信息

**参数**:
- `database` (string, 必需): 数据库名称
- `table` (string, 必需): 表名称

**示例**:
```json
{
  "name": "get_table_info",
  "arguments": {
    "database": "test_db",
    "table": "users"
  }
}
```

#### create_table
创建新表

**参数**:
- `database` (string, 必需): 数据库名称
- `name` (string, 必需): 表名称
- `columns` (array, 必需): 列定义数组
- `engine` (string, 可选): 存储引擎，默认为OLAP

**列定义格式**:
```json
{
  "name": "column_name",
  "type": "VARCHAR(255)",
  "isKey": false,
  "isNull": true,
  "defaultValue": null,
  "comment": "列注释"
}
```

**示例**:
```json
{
  "name": "create_table",
  "arguments": {
    "database": "test_db",
    "name": "users",
    "columns": [
      {
        "name": "id",
        "type": "BIGINT",
        "isKey": true,
        "isNull": false,
        "comment": "用户ID"
      },
      {
        "name": "name",
        "type": "VARCHAR(100)",
        "isKey": false,
        "isNull": false,
        "comment": "用户姓名"
      },
      {
        "name": "email",
        "type": "VARCHAR(255)",
        "isKey": false,
        "isNull": true,
        "comment": "邮箱地址"
      }
    ],
    "engine": "OLAP"
  }
}
```

#### drop_table
删除表

**参数**:
- `database` (string, 必需): 数据库名称
- `table` (string, 必需): 表名称

**示例**:
```json
{
  "name": "drop_table",
  "arguments": {
    "database": "test_db",
    "table": "users"
  }
}
```

### 4. 查询操作

#### execute_query
执行SQL查询

**参数**:
- `sql` (string, 必需): SQL查询语句
- `timeout` (number, 可选): 查询超时时间（秒），默认300
- `maxRows` (number, 可选): 最大返回行数，默认10000

**返回**: 查询结果，包括列名、数据行、行数、执行时间

**示例**:
```json
{
  "name": "execute_query",
  "arguments": {
    "sql": "SELECT * FROM test_db.users LIMIT 10",
    "timeout": 60,
    "maxRows": 1000
  }
}
```

### 5. 用户管理

#### list_users
列出所有用户

**参数**: 无

**返回**: 用户列表

**示例**:
```json
{
  "name": "list_users",
  "arguments": {}
}
```

#### create_user
创建新用户

**参数**:
- `username` (string, 必需): 用户名
- `password` (string, 必需): 密码
- `privileges` (array, 可选): 权限列表

**示例**:
```json
{
  "name": "create_user",
  "arguments": {
    "username": "newuser",
    "password": "secure_password",
    "privileges": ["SELECT", "INSERT", "UPDATE"]
  }
}
```

## 数据类型

### StarRocks支持的数据类型

- **数值类型**: TINYINT, SMALLINT, INT, BIGINT, LARGEINT, FLOAT, DOUBLE, DECIMAL
- **字符串类型**: CHAR, VARCHAR, STRING
- **日期时间类型**: DATE, DATETIME, TIMESTAMP
- **布尔类型**: BOOLEAN
- **JSON类型**: JSON

### 存储引擎

- **OLAP**: 默认的列式存储引擎，适用于分析查询
- **MYSQL**: MySQL兼容引擎
- **BROKER**: 外部数据源引擎
- **HIVE**: Hive兼容引擎

## 错误处理

所有工具调用都可能返回以下格式的错误：

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: 具体错误信息"
    }
  ]
}
```

常见错误类型：
- **参数错误**: 缺少必需参数或参数类型不正确
- **连接错误**: 无法连接到StarRocks集群
- **权限错误**: 用户权限不足
- **SQL错误**: SQL语法错误或执行失败
- **资源错误**: 集群资源不足

## 最佳实践

### 1. 数据库设计
- 使用合适的列类型和长度
- 为重要列添加注释
- 合理设置主键和索引

### 2. 查询优化
- 使用LIMIT限制结果集大小
- 设置合适的超时时间
- 避免SELECT *，只查询需要的列

### 3. 安全考虑
- 使用强密码
- 定期轮换访问密钥
- 限制用户权限

### 4. 监控和维护
- 定期检查集群指标
- 监控查询性能
- 及时清理无用数据

## 配置示例

### 环境变量配置
```bash
# 阿里云配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_REGION=cn-hangzhou

# StarRocks配置
STARROCKS_CLUSTER_ID=your_cluster_id
STARROCKS_ENDPOINT=https://your-cluster-endpoint.emrserverless.cn
STARROCKS_USERNAME=your_username
STARROCKS_PASSWORD=your_password
```

### Claude Desktop配置
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

## 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 验证集群端点是否正确
   - 确认集群状态

2. **认证失败**
   - 检查访问密钥是否正确
   - 确认密钥权限是否足够
   - 验证用户名密码

3. **查询超时**
   - 增加超时时间
   - 优化SQL查询
   - 检查集群负载

4. **权限不足**
   - 检查用户权限
   - 确认数据库/表访问权限
   - 联系管理员

### 调试模式

启用详细日志：
```bash
DEBUG=* npm run dev
```

### 日志查看

查看服务器日志：
```bash
tail -f logs/mcp-server.log
```