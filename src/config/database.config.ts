import mongoose from "mongoose";
import { logger } from "./logger.config.ts";
import { dbConfig } from "./index.ts";

const connectToDatabase = async () => {
	try {
		await mongoose.connect(dbConfig.MONGO_URI);
		logger.info("Successfully connected to the database");
	} catch (error) {
		logger.error("Something went wrong while connecting to the database");
	}
};

export { connectToDatabase };
