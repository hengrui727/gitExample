import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AliyunEMRConfig } from '../types/starrocks.js';

export class AliyunEMRClient {
  private client: AxiosInstance;
  private config: AliyunEMRConfig;

  constructor(config: AliyunEMRConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `https://emrserverless.${config.region}.aliyuncs.com`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // 添加请求拦截器进行签名
    this.client.interceptors.request.use(this.addSignature.bind(this));
  }

  private addSignature(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // 这里需要实现阿里云API签名算法
    // 简化版本，实际使用时需要完整的签名实现
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2);
    
    config.headers.set('X-Acs-Signature', 'signature-placeholder');
    config.headers.set('X-Acs-Signature-Method', 'HMAC-SHA1');
    config.headers.set('X-Acs-Signature-Version', '1.0');
    config.headers.set('X-Acs-Version', '2022-10-19');
    config.headers.set('X-Acs-Timestamp', timestamp);
    config.headers.set('X-Acs-Nonce', nonce);

    return config;
  }

  async getClusterInfo(): Promise<any> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cluster info: ${error}`);
    }
  }

  async listDatabases(): Promise<any[]> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}/databases`);
      return response.data.databases || [];
    } catch (error) {
      throw new Error(`Failed to list databases: ${error}`);
    }
  }

  async createDatabase(databaseName: string, description?: string): Promise<any> {
    try {
      const response = await this.client.post(`/clusters/${this.config.clusterId}/databases`, {
        databaseName,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create database: ${error}`);
    }
  }

  async dropDatabase(databaseName: string): Promise<any> {
    try {
      const response = await this.client.delete(`/clusters/${this.config.clusterId}/databases/${databaseName}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to drop database: ${error}`);
    }
  }

  async listTables(databaseName: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}/databases/${databaseName}/tables`);
      return response.data.tables || [];
    } catch (error) {
      throw new Error(`Failed to list tables: ${error}`);
    }
  }

  async getTableInfo(databaseName: string, tableName: string): Promise<any> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}/databases/${databaseName}/tables/${tableName}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get table info: ${error}`);
    }
  }

  async executeQuery(sql: string, timeout: number = 300): Promise<any> {
    try {
      const response = await this.client.post(`/clusters/${this.config.clusterId}/query`, {
        sql,
        timeout,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute query: ${error}`);
    }
  }

  async getClusterMetrics(): Promise<any> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}/metrics`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cluster metrics: ${error}`);
    }
  }

  async listUsers(): Promise<any[]> {
    try {
      const response = await this.client.get(`/clusters/${this.config.clusterId}/users`);
      return response.data.users || [];
    } catch (error) {
      throw new Error(`Failed to list users: ${error}`);
    }
  }

  async createUser(username: string, password: string, privileges?: string[]): Promise<any> {
    try {
      const response = await this.client.post(`/clusters/${this.config.clusterId}/users`, {
        username,
        password,
        privileges,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }
}