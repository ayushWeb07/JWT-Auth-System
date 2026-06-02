// get user by username or email
import type { GetUserByUsernameOrEmailDTO } from "../dtos/user.dto.ts";
import { userModel } from "../database/models/user.model.ts";
import { logger } from "../config/logger.config.ts";
import {
	InternalServerError,
	NotFoundError,
} from "../utils/errors/app.error.ts";

const getUserByUsernameOrEmail = async (
	payload: GetUserByUsernameOrEmailDTO,
) => {
	try {
		// fetch the user
		const user = await userModel.findOne({
			$or: [
				{
					username: payload.username,
				},
				{
					email: payload.email,
				},
			],
		});

		if (!user) {
			logger.error("Users: getUserByUsernameOrEmail endpoint -> failure", {
				error: "User not found",
				username: payload.username,
				email: payload.email,
			});

			throw new NotFoundError("User not found");
		} else {
			logger.info("Users: getUserByUsernameOrEmail endpoint -> success", {
				userId: user._id,
			});

			return user;
		}
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		} else {
			logger.error(
				"Users: getUserByUsernameOrEmail endpoint -> failure",
				error,
			);

			throw new InternalServerError(
				"Something went wrong while getting the user by email or username",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

export { getUserByUsernameOrEmail };
