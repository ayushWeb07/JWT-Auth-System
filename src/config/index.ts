import "dotenv/config";

interface ServerConfig {
	PORT: number;
	CRYPTO_SECRET_KEY: string;
	ACCESS_SECRET_KEY: string;
	REFRESH_SECRET_KEY: string;
	MAIL_USER_ADDRESS: string;
	MAIL_APP_PASSWORD: string;
}

interface DbConfig {
	MONGO_URI: string;
}

const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3000,
	CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY || "",
	ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY || "",
	REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY || "",
	MAIL_USER_ADDRESS: process.env.MAIL_USER_ADDRESS || "",
	MAIL_APP_PASSWORD: process.env.MAIL_APP_PASSWORD || "",
};

const dbConfig: DbConfig = {
	MONGO_URI: process.env.MONGO_URI || "",
};

export { serverConfig, dbConfig };
