import type { RegisterUserDTO } from "../dtos/auth.dto.ts";
import { userModel } from "../database/models/user.model.ts";
import { logger } from "../config/logger.config.ts";
import { InternalServerError } from "../utils/errors/app.error.ts";
import CryptoJS from "crypto-js";
import { serverConfig } from "../config/index.ts";

const registerUser = async (payload: RegisterUserDTO) => {
	try {
		// hash the password
		const hashedPassword = CryptoJS.AES.encrypt(
			payload.password,
			serverConfig.CRYPTO_SECRET_KEY,
		).toString();

		// insert the user
		const newUser = await userModel.create({
			username: payload.username,
			email: payload.email,
			password: hashedPassword,
		});

		logger.info("Auth: registerUser endpoint -> success", {
			id: newUser._id,
		});

		return newUser;
	} catch (error) {
		logger.error("Auth: registerUser endpoint -> failure", error);

		throw new InternalServerError(
			"Something went wrong while creating a new user",
			error instanceof Error ? error.stack : undefined,
		);
	}
};

export { registerUser };
