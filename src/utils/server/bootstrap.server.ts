import { logger } from "../../config/logger.config.ts";
import { serverConfig } from "../../config/index.ts";
import type { Express } from "express";
import { connectToDatabase } from "../../config/database.config.ts";

const bootstrapServer = async (app: Express) => {
	try {
		await connectToDatabase();

		app.listen(serverConfig.PORT, async () => {
			logger.info(`Server listening on http://localhost:${serverConfig.PORT}`);
		});
	} catch (error) {
		process.exit(1);
	}
};

export { bootstrapServer };
