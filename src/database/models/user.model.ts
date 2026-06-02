import mongoose from "mongoose";

// create the user schema
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: [true, "Username must be unique"],
			minLength: [6, "Username must have at least 6 characters"],
			maxLength: [20, "Username must have at most 20 characters"],
		},

		email: {
			type: String,
			required: [true, "Email is required"],
			unique: [true, "Email must be unique"],
			minLength: [6, "Email must have at least 6 characters"],
			maxLength: [20, "Email must have at most 20 characters"],
		},

		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [8, "Password must have at least 8 characters"],
		},

		refreshToken: {
			type: String,
			required: [true, "Refresh token is required"],
		}
	},
	{
		timestamps: true,
	},
);

// create the users model
const userModel = mongoose.model("users", userSchema);

export { userModel };
