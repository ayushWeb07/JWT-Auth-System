import * as authRepository from "../repositories/auth.repository.ts";
import type { LoginUserDTO, RegisterUserDTO } from "../dtos/auth.dto.ts";

const registerUser = async (payload: RegisterUserDTO) => {
	// register the user and generate the token
	const token = await authRepository.registerUser(payload);
	return token;
};

const loginUser = async (payload: LoginUserDTO) => {
	// login the user and generate the token
	const token = await authRepository.loginUser(payload);
	return token;
};

export { registerUser, loginUser };
