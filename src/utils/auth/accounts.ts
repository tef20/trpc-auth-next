import { argon2id, hash, verify } from "argon2";
import logger from "@/utils/logger";

export async function hashPassword(password: string) {
  try {
    return await hash(password, {
      type: argon2id,
    });
  } catch (error) {
    logger.error("Failed to hash password:", error);

    throw error;
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await verify(hashedPassword, password);
}
