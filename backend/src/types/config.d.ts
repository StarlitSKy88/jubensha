declare module '@config' {
  interface Config {
    server: {
      port: number;
      env: string;
    };
    jwt: {
      secret: string;
      expiresIn: string;
    };
    log: {
      level: string;
      filename: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
    milvus: {
      address: string;
      username?: string;
      password?: string;
      collection: string;
      ssl: boolean;
    };
    openai: {
      apiKey: string;
      models: {
        embedding: string;
        chat: string;
        completion: string;
      };
    };
    mongodb: {
      uri: string;
      options: {
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
        maxPoolSize: number;
      };
    };
  }

  export const config: Config;
} 