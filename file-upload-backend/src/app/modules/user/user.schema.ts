import { model, Schema } from "mongoose";
import { IUser, Role } from "./user.types";

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: Role, default: Role.USER },
    }
);

export const User = model<IUser>("User", userSchema);