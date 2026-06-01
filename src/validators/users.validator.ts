import z from "zod";

const getUserByUsernameOrEmailSchema = z.object({
	username: z.string().min(6).max(20),
	email: z.string().min(6).max(20),
});

const createUserSchema = z.object({
	username: z.string().min(6).max(20),
	email: z.string().min(6).max(20),
	password: z.string().min(8).max(20),
});

export { getUserByUsernameOrEmailSchema, createUserSchema };
