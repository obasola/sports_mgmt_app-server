import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  apiPrefix: string;
  database: {
    url: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  database: {
    url: process.env.DATABASE_URL || 'mysql://user:Password2023!@localhost:3306/MyNFL',
  },
};

export default config;