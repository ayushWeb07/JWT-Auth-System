import "dotenv/config";

interface ServerConfig {
	PORT: number;
	CRYPTO_SECRET_KEY: string;
	ACCESS_SECRET_KEY: string;
	REFRESH_SECRET_KEY: string;
}

interface DbConfig {
	MONGO_URI: string;
}

const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3000,
	CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY || "",
	ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY || "",
	REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY || "",
};

const dbConfig: DbConfig = {
	MONGO_URI: process.env.MONGO_URI || "",
};

export { serverConfig, dbConfig };
