import { uniqueKey } from "../domain/normalize";
import { UserModel } from "../models/user.model";
import type { Role } from "../http/middleware/auth";
import type { User } from "./types";

function map(d: { _id: unknown; username: string; role: Role; passwordHash: string }): User {
  return { id: String(d._id), username: d.username, role: d.role, passwordHash: d.passwordHash };
}

export interface UsersRepo {
  findById(id: string): Promise<User | null>;
  findByUsername(nombre: string): Promise<User | null>;
  list(): Promise<User[]>;
  create(data: { username: string; passwordHash: string; role: Role }): Promise<User>;
  update(id: string, data: Partial<{ username: string; passwordHash: string; role: Role }>): Promise<User | null>;
  remove(id: string): Promise<boolean>;
}

export class MongooseUsersRepo implements UsersRepo {
  async findById(id: string): Promise<User | null> {
    const d = await UserModel.findById(id).lean();
    return d ? map(d) : null;
  }
  async findByUsername(nombre: string): Promise<User | null> {
    const d = await UserModel.findOne({ usernameKey: uniqueKey(nombre) }).lean();
    return d ? map(d) : null;
  }
  async list(): Promise<User[]> {
    const ds = await UserModel.find().sort({ username: 1 }).lean();
    return ds.map(map);
  }
  async create(data: { username: string; passwordHash: string; role: Role }): Promise<User> {
    const d = await UserModel.create({
      username: data.username.trim(),
      usernameKey: uniqueKey(data.username),
      passwordHash: data.passwordHash,
      role: data.role,
    });
    return map(d.toObject());
  }
  async update(id: string, data: Partial<{ username: string; passwordHash: string; role: Role }>): Promise<User | null> {
    const patch: Record<string, unknown> = {};
    if (data.username !== undefined) {
      patch["username"] = data.username.trim();
      patch["usernameKey"] = uniqueKey(data.username);
    }
    if (data.passwordHash !== undefined) patch["passwordHash"] = data.passwordHash;
    if (data.role !== undefined) patch["role"] = data.role;
    const d = await UserModel.findByIdAndUpdate(id, patch, { new: true }).lean();
    return d ? map(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    const r = await UserModel.findByIdAndDelete(id).lean();
    return r !== null;
  }
}
