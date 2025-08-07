export interface StarRocksCluster {
  clusterId: string;
  clusterName: string;
  status: string;
  region: string;
  endpoint: string;
}

export interface StarRocksDatabase {
  name: string;
  description?: string;
  createdTime: string;
}

export interface StarRocksTable {
  name: string;
  database: string;
  type: 'OLAP' | 'MYSQL' | 'BROKER' | 'HIVE';
  engine: string;
  schema: StarRocksColumn[];
  partitionInfo?: any;
  distributionInfo?: any;
  properties?: Record<string, any>;
}

export interface StarRocksColumn {
  name: string;
  type: string;
  isKey: boolean;
  isNull: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface StarRocksQueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export interface StarRocksUser {
  username: string;
  host: string;
  privileges: string[];
}

export interface StarRocksResource {
  name: string;
  type: 'CPU' | 'MEMORY' | 'STORAGE';
  quota: number;
  used: number;
  available: number;
}

export interface CreateDatabaseRequest {
  name: string;
  description?: string;
}

export interface CreateTableRequest {
  database: string;
  name: string;
  columns: StarRocksColumn[];
  engine?: string;
  partitionInfo?: any;
  distributionInfo?: any;
  properties?: Record<string, any>;
}

export interface QueryRequest {
  sql: string;
  timeout?: number;
  maxRows?: number;
}

export interface AliyunEMRConfig {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  clusterId: string;
  endpoint: string;
}