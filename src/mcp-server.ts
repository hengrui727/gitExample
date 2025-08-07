import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AliyunEMRClient } from './services/aliyun-emr-client.js';
import { StarRocksClient } from './services/starrocks-client.js';
import { AliyunEMRConfig } from './types/starrocks.js';
import dotenv from 'dotenv';

dotenv.config();

class StarRocksMCPServer {
  private server: Server;
  private emrClient!: AliyunEMRClient;
  private starrocksClient!: StarRocksClient;

  constructor() {
    this.server = new Server(
      {
        name: 'emr-starrocks-mcp',
        version: '1.0.0',
      }
    );

    this.setupTools();
    this.setupClients();
  }

  private setupClients() {
    const config: AliyunEMRConfig = {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
      region: process.env.ALIYUN_REGION || 'cn-hangzhou',
      clusterId: process.env.STARROCKS_CLUSTER_ID || '',
      endpoint: process.env.STARROCKS_ENDPOINT || '',
    };

    this.emrClient = new AliyunEMRClient(config);
    this.starrocksClient = new StarRocksClient(
      config.endpoint,
      process.env.STARROCKS_USERNAME,
      process.env.STARROCKS_PASSWORD
    );
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_cluster_info',
            description: '获取EMR Serverless StarRocks集群信息',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_databases',
            description: '列出所有数据库',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_database',
            description: '创建新数据库',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '数据库名称',
                },
                description: {
                  type: 'string',
                  description: '数据库描述',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'drop_database',
            description: '删除数据库',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '数据库名称',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'list_tables',
            description: '列出指定数据库中的所有表',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: '数据库名称',
                },
              },
              required: ['database'],
            },
          },
          {
            name: 'get_table_info',
            description: '获取表详细信息',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: '数据库名称',
                },
                table: {
                  type: 'string',
                  description: '表名称',
                },
              },
              required: ['database', 'table'],
            },
          },
          {
            name: 'execute_query',
            description: '执行SQL查询',
            inputSchema: {
              type: 'object',
              properties: {
                sql: {
                  type: 'string',
                  description: 'SQL查询语句',
                },
                timeout: {
                  type: 'number',
                  description: '查询超时时间（秒）',
                },
                maxRows: {
                  type: 'number',
                  description: '最大返回行数',
                },
              },
              required: ['sql'],
            },
          },
          {
            name: 'create_table',
            description: '创建新表',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: '数据库名称',
                },
                name: {
                  type: 'string',
                  description: '表名称',
                },
                columns: {
                  type: 'array',
                  description: '列定义',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      isKey: { type: 'boolean' },
                      isNull: { type: 'boolean' },
                      defaultValue: { type: 'string' },
                      comment: { type: 'string' },
                    },
                  },
                },
                engine: {
                  type: 'string',
                  description: '存储引擎',
                },
              },
              required: ['database', 'name', 'columns'],
            },
          },
          {
            name: 'drop_table',
            description: '删除表',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: '数据库名称',
                },
                table: {
                  type: 'string',
                  description: '表名称',
                },
              },
              required: ['database', 'table'],
            },
          },
          {
            name: 'get_cluster_metrics',
            description: '获取集群监控指标',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_users',
            description: '列出所有用户',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_user',
            description: '创建新用户',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: '用户名',
                },
                password: {
                  type: 'string',
                  description: '密码',
                },
                privileges: {
                  type: 'array',
                  description: '权限列表',
                  items: { type: 'string' },
                },
              },
              required: ['username', 'password'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_cluster_info':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.emrClient.getClusterInfo(), null, 2),
                },
              ],
            };

          case 'list_databases':
            const databases = await this.starrocksClient.getDatabases();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(databases, null, 2),
                },
              ],
            };

          case 'create_database':
            if (!args || typeof args.name !== 'string') {
              throw new Error('Database name is required');
            }
            await this.starrocksClient.createDatabase(args.name);
            return {
              content: [
                {
                  type: 'text',
                  text: `Database '${args.name}' created successfully.`,
                },
              ],
            };

          case 'drop_database':
            if (!args || typeof args.name !== 'string') {
              throw new Error('Database name is required');
            }
            await this.starrocksClient.dropDatabase(args.name);
            return {
              content: [
                {
                  type: 'text',
                  text: `Database '${args.name}' dropped successfully.`,
                },
              ],
            };

          case 'list_tables':
            if (!args || typeof args.database !== 'string') {
              throw new Error('Database name is required');
            }
            const tables = await this.starrocksClient.getTables(args.database);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tables, null, 2),
                },
              ],
            };

          case 'get_table_info':
            if (!args || typeof args.database !== 'string' || typeof args.table !== 'string') {
              throw new Error('Database name and table name are required');
            }
            const tableInfo = await this.starrocksClient.getTableSchema(args.database, args.table);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tableInfo, null, 2),
                },
              ],
            };

          case 'execute_query':
            if (!args || typeof args.sql !== 'string') {
              throw new Error('SQL query is required');
            }
            const result = await this.starrocksClient.executeQuery({
              sql: args.sql,
              timeout: typeof args.timeout === 'number' ? args.timeout : undefined,
              maxRows: typeof args.maxRows === 'number' ? args.maxRows : undefined,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };

          case 'create_table':
            if (!args || typeof args.database !== 'string' || typeof args.name !== 'string' || !Array.isArray(args.columns)) {
              throw new Error('Database name, table name, and columns are required');
            }
            const createTableSQL = this.buildCreateTableSQL(args);
            await this.starrocksClient.createTable(createTableSQL);
            return {
              content: [
                {
                  type: 'text',
                  text: `Table '${args.database}.${args.name}' created successfully.`,
                },
              ],
            };

          case 'drop_table':
            if (!args || typeof args.database !== 'string' || typeof args.table !== 'string') {
              throw new Error('Database name and table name are required');
            }
            await this.starrocksClient.dropTable(args.database, args.table);
            return {
              content: [
                {
                  type: 'text',
                  text: `Table '${args.database}.${args.table}' dropped successfully.`,
                },
              ],
            };

          case 'get_cluster_metrics':
            const metrics = await this.emrClient.getClusterMetrics();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(metrics, null, 2),
                },
              ],
            };

          case 'list_users':
            const users = await this.emrClient.listUsers();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(users, null, 2),
                },
              ],
            };

          case 'create_user':
            if (!args || typeof args.username !== 'string' || typeof args.password !== 'string') {
              throw new Error('Username and password are required');
            }
            await this.emrClient.createUser(args.username, args.password, Array.isArray(args.privileges) ? args.privileges : undefined);
            return {
              content: [
                {
                  type: 'text',
                  text: `User '${args.username}' created successfully.`,
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private buildCreateTableSQL(args: any): string {
    const columns = args.columns.map((col: any) => {
      let colDef = `${col.name} ${col.type}`;
      if (!col.isNull) colDef += ' NOT NULL';
      if (col.defaultValue) colDef += ` DEFAULT ${col.defaultValue}`;
      if (col.comment) colDef += ` COMMENT '${col.comment}'`;
      return colDef;
    }).join(', ');

    const engine = args.engine || 'OLAP';
    return `CREATE TABLE ${args.database}.${args.name} (${columns}) ENGINE = ${engine}`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EMR StarRocks MCP Server started');
  }
}

const server = new StarRocksMCPServer();
server.run().catch(console.error);