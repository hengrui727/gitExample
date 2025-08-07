import axios, { AxiosInstance } from 'axios';
import { StarRocksQueryResult, QueryRequest } from '../types/starrocks.js';

export class StarRocksClient {
  private client: AxiosInstance;
  private endpoint: string;

  constructor(endpoint: string, username?: string, password?: string) {
    this.endpoint = endpoint;
    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (username && password) {
      this.client.defaults.auth = {
        username,
        password,
      };
    }
  }

  async executeQuery(request: QueryRequest): Promise<StarRocksQueryResult> {
    try {
      const response = await this.client.post('/api/v1/query', {
        sql: request.sql,
        timeout: request.timeout || 300,
        maxRows: request.maxRows || 10000,
      });

      return {
        columns: response.data.columns || [],
        rows: response.data.rows || [],
        rowCount: response.data.rowCount || 0,
        executionTime: response.data.executionTime || 0,
      };
    } catch (error) {
      throw new Error(`Failed to execute query: ${error}`);
    }
  }

  async getDatabases(): Promise<string[]> {
    try {
      const result = await this.executeQuery({
        sql: 'SHOW DATABASES',
      });
      return result.rows.map(row => row[0]);
    } catch (error) {
      throw new Error(`Failed to get databases: ${error}`);
    }
  }

  async getTables(database: string): Promise<string[]> {
    try {
      const result = await this.executeQuery({
        sql: `SHOW TABLES FROM ${database}`,
      });
      return result.rows.map(row => row[0]);
    } catch (error) {
      throw new Error(`Failed to get tables: ${error}`);
    }
  }

  async getTableSchema(database: string, table: string): Promise<any> {
    try {
      const result = await this.executeQuery({
        sql: `DESCRIBE ${database}.${table}`,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get table schema: ${error}`);
    }
  }

  async createDatabase(name: string): Promise<void> {
    try {
      await this.executeQuery({
        sql: `CREATE DATABASE IF NOT EXISTS ${name}`,
      });
    } catch (error) {
      throw new Error(`Failed to create database: ${error}`);
    }
  }

  async dropDatabase(name: string): Promise<void> {
    try {
      await this.executeQuery({
        sql: `DROP DATABASE IF EXISTS ${name}`,
      });
    } catch (error) {
      throw new Error(`Failed to drop database: ${error}`);
    }
  }

  async createTable(createTableSQL: string): Promise<void> {
    try {
      await this.executeQuery({
        sql: createTableSQL,
      });
    } catch (error) {
      throw new Error(`Failed to create table: ${error}`);
    }
  }

  async dropTable(database: string, table: string): Promise<void> {
    try {
      await this.executeQuery({
        sql: `DROP TABLE IF EXISTS ${database}.${table}`,
      });
    } catch (error) {
      throw new Error(`Failed to drop table: ${error}`);
    }
  }

  async insertData(database: string, table: string, data: any[]): Promise<void> {
    try {
      const values = data.map(row => 
        `(${row.map((value: any) => typeof value === 'string' ? `'${value}'` : value).join(', ')})`
      ).join(', ');
      
      await this.executeQuery({
        sql: `INSERT INTO ${database}.${table} VALUES ${values}`,
      });
    } catch (error) {
      throw new Error(`Failed to insert data: ${error}`);
    }
  }

  async getClusterStatus(): Promise<any> {
    try {
      const result = await this.executeQuery({
        sql: 'SHOW PROC "/backends"',
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get cluster status: ${error}`);
    }
  }

  async getQueryHistory(limit: number = 100): Promise<any> {
    try {
      const result = await this.executeQuery({
        sql: `SELECT * FROM information_schema.query_history ORDER BY start_time DESC LIMIT ${limit}`,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get query history: ${error}`);
    }
  }
}