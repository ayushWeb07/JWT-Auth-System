export interface RegisterUserDTO {
	username: string;
	email: string;
	password: string;
}

export interface LoginUserDTO {
	username: string;
	email: string;
	password: string;
}

export interface RefreshAccessTokenDTO {
	token: string | undefined;
}

export interface LogoutUserDTO {
	token: string | undefined;
}

export interface LogoutUserFromAllSessionsDTO {
	token: string | undefined;
}
