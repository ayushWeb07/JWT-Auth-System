import "dotenv/config";

interface ServerConfig {
    PORT: number;
}

interface DbConfig {
    DATABASE_URL: string;
}

const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3000,
};

const dbConfig: DbConfig = {
    DATABASE_URL: process.env.DATABASE_URL || "",
};

export { serverConfig, dbConfig };
