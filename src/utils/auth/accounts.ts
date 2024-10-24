import { argon2id, hash, verify } from "argon2";

export async function hashPassword(password: string) {
  try {
    return await hash(password, {
      type: argon2id,
    });
  } catch (error) {
    console.error("Failed to hash password:", error);

    throw error;
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await verify(hashedPassword, password);
}
