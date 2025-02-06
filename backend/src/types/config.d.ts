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
  }

  export const config: Config;
} 