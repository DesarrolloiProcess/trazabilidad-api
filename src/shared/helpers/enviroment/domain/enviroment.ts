export interface IEnviroment {
  NODE_ENV: 'development' | 'production' | 'test';
  APP: {
    PORT_API_WEB: number;
  };
  DB: {
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    NAME: string;
  };
  JWT: {
    PRIVATE_KEY_PATH: string;
    PUBLIC_KEY_PATH: string;
    EXPIRES_IN: string;
  };
  BCRYPT: {
    SALT_ROUNDS: number;
  };
  WHATSAPP: {
    API_URL: string;
    API_TOKEN: string;
    SENDER_ID: string;
  };
  CORS: {
    ORIGIN: string;
  };
}
