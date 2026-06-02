// Import the Nodemailer library
import nodemailer from "nodemailer";
import { serverConfig } from "./index.ts";

// Create a transporter object
const gmailTransporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: serverConfig.MAIL_USER_ADDRESS,
		pass: serverConfig.MAIL_APP_PASSWORD,
	},
});

export { gmailTransporter };
