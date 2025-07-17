interface EnvironmentConfig {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    MOYASAR_API_KEY: string;
    USE_HTTPS: boolean;
}
export declare const envConfig: EnvironmentConfig;
export {};
