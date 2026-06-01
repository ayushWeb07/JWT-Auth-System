export interface GetUserByUsernameOrEmailDTO {
	username: string;
	email: string;
}

export interface CreateUserDTO {
	username: string;
	email: string;
	password: string;
}
