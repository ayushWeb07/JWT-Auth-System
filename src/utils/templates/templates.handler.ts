import path from "node:path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { InternalServerError } from "../errors/app.error.ts";
import { logger } from "../../config/logger.config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const renderTemplateContent = async (
	templateId: string,
	params: Record<string, any>,
) => {
	const fullPath = path.join(__dirname, "mail", `${templateId}.hbs`);

	try {
		const templateContent = await fs.readFile(fullPath, { encoding: "utf8" });
		const template = Handlebars.compile(templateContent);
		return template(params);
	} catch (err) {
		logger.error(
			`Something went went while rendering the template: ${templateId}`,
		);
		throw new InternalServerError(
			`Something went went while rendering the template: ${templateId}`,
		);
	}
};

export { renderTemplateContent };
