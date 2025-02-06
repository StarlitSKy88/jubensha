declare namespace Express {
  interface Request {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      permissions?: string[];
      status?: string;
    };
    token?: string;
  }
} 