import { argon2id, hash, verify } from "argon2";

export async function hashPassword(password: string) {
  return await hash(password, {
    type: argon2id,
  });
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await verify(hashedPassword, password);
}
