import * as authRepository from "../repositories/auth.repository.ts";
import type { LoginUserDTO, RegisterUserDTO } from "../dtos/auth.dto.ts";

interface AuthUserResult {
	accessToken: string;
	refreshToken: string;
}

const registerUser = async (payload: RegisterUserDTO) => {
	// register the user and generate the token
	const result = (await authRepository.registerUser(payload)) as AuthUserResult;
	return result;
};

const loginUser = async (payload: LoginUserDTO) => {
	// login the user and generate the token
	const result = (await authRepository.loginUser(payload)) as AuthUserResult;
	return result;
};

export { registerUser, loginUser };
