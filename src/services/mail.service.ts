import type { SendEmailDTO } from "../dtos/mailer.dto.ts";
import { renderTemplateContent } from "../utils/templates/templates.handler.ts";
import { serverConfig } from "../config/index.ts";
import { gmailTransporter } from "../config/nodemailer.config.ts";
import { logger } from "../config/logger.config.ts";

const sendEmail = async (payload: SendEmailDTO) => {
	try {
		logger.info(`Processing the email...`);

		// get the email content
		const emailContent = await renderTemplateContent(
			payload.templateId,
			payload.params,
		);

		// Configure the mail object
		const mailOptions = {
			from: serverConfig.MAIL_USER_ADDRESS,
			to: payload.toMailAddress,
			subject: payload.subject,
			text: emailContent,
		};

		// Send the email
		await gmailTransporter.sendMail(mailOptions);

		logger.info(
			`Successfully sent the email to ${payload.toMailAddress} with template id: ${payload.templateId}`,
		);
	} catch (error) {
		logger.error(
			`Something went wrong while sending the email to ${payload.toMailAddress} with template id: ${payload.templateId}`,
		);

		throw error;
	}
};

export { sendEmail };
