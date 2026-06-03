import z from "zod";

const getUserByUsernameOrEmailSchema = z.object({
	username: z.string().min(6).max(50),
	email: z.string().min(6).max(50),
});

export { getUserByUsernameOrEmailSchema };
