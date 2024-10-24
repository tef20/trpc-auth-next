import { db } from "@/db";
import { hashPassword } from "./auth/accounts";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createNewUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const passwordHash = await hashPassword(password);

    return (
      await db
        .insert(usersTable)
        .values({
          username: email,
          passwordHash: passwordHash,
        })
        .returning({ id: usersTable.id })
    )[0];
  } catch (error) {
    console.error("Failed to create user:", error);
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
        .where(eq(usersTable.username, email))
        .limit(1)
    )[0];
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  console.log("getting userId:", userId);
  try {
    return (
      await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
    )[0];
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
}
