import "dotenv/config";

interface ServerConfig {
	PORT: number;
}

interface DbConfig {
	MONGO_URI: string;
}

const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3000,
};

const dbConfig: DbConfig = {
	MONGO_URI: process.env.MONGO_URI || "",
};

export { serverConfig, dbConfig };
