import { Schema, model, type Document } from "mongoose";
import { ROLES, type Role } from "../http/middleware/auth";

export interface UserDoc extends Document {
  username: string;
  usernameKey: string;
  passwordHash: string;
  role: Role;
}

const userSchema = new Schema<UserDoc>(
  {
    username: { type: String, required: true, trim: true },
    usernameKey: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ROLES },
  },
  { timestamps: true },
);

export const UserModel = model<UserDoc>("User", userSchema);
