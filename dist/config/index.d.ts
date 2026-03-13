interface Config {
    port: number;
    nodeEnv: string;
    mongodb: {
        uri: string;
    };
    gemini: {
        apiKey: string;
    };
    session: {
        secret: string;
    };
    cookie: {
        secret: string;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map