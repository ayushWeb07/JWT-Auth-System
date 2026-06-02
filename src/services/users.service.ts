import * as usersRepository from "../repositories/users.repository.ts";
import type { GetCurrentUserDTO } from "../dtos/user.dto.ts";

const getCurrentUser = async (payload: GetCurrentUserDTO) => {
	const user = await usersRepository.getCurrentUser(payload);
	return user;
};

export { getCurrentUser };
