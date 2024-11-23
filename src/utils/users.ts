import { db } from "@/db";
import { hashPassword } from "@/utils/auth/accounts";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger";

export async function createNewUser({
  email,
  username,
  password,
  isVerified = false,
}: {
  email: string;
  username: string;
  isVerified: boolean;
  password: string;
}) {
  try {
    const passwordHash = await hashPassword(password);

    return (
      await db
        .insert(usersTable)
        .values({
          username: username,
          email: email.toLowerCase(),
          passwordHash,
          isVerified: isVerified,
        })
        .returning({ id: usersTable.id })
    )[0];
  } catch (error) {
    logger.error("Failed to create user:", error);
    throw error;
  }
}

export async function setUserPassword(email: string) {
  try {
    return await db
      .update(usersTable)
      .set({ passwordHash: await hashPassword("password") })
      .where(eq(usersTable.email, email))
      .returning({ id: usersTable.id });
  } catch (error) {
    logger.error("Failed to verify user:", error);

    throw error;
  }
}

export async function getUserCredentialsByEmail(email: string) {
  try {
    return (
      await db
        .select({
          id: usersTable.id,
          passwordHash: usersTable.passwordHash,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
    )[0];
  } catch (error) {
    logger.error("Failed to get user:", error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  logger.log("getting userId:", userId);
  try {
    return (
      await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          username: usersTable.username,
          isVerified: usersTable.isVerified,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
    )[0];
  } catch (error) {
    logger.error("Failed to get user:", error);
    throw error;
  }
}
