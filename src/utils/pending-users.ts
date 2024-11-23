import { db } from "@/db";
import { hashPassword, verifyPassword } from "@/utils/auth/accounts";
import { unverifiedUsersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger";
import { sendEmail } from "./email/send-email";

export async function createNewUnverifiedUser({
  username,
  email,
  verificationCode,
}: {
  username: string;
  email: string;
  verificationCode: string;
}) {
  const verificationCodeHash = await hashPassword(verificationCode);

  try {
    return (
      await db
        .insert(unverifiedUsersTable)
        .values({
          username,
          email: email.toLowerCase(),
          verificationCodeHash,
        })
        .returning({ id: unverifiedUsersTable.id })
    )[0];
  } catch (error) {
    logger.error("Failed to create user:", error);
    throw error;
  }
}

export async function sendVerificationEmail({
  email,
  username,
  code,
}: {
  email: string;
  username: string;
  code: string;
}) {
  return await sendEmail({
    to: email.toLowerCase(),
    subject: "Welcome, please verify your email",
    body: `Hello, ${username}!\n\nHere is your verification code: ${code}.`,
  });
}

export async function verifyUserEmail(email: string, code: string) {
  try {
    const { id, verificationCodeHash } =
      await getUnverifiedUserCredentialsByEmail(email);

    const isValid = await verifyPassword(code, verificationCodeHash);

    if (!isValid) {
      throw new Error("Invalid verification code");
    }

    return (
      await db
        .update(unverifiedUsersTable)
        .set({ isVerified: true })
        .where(eq(unverifiedUsersTable.id, id))
        .returning({ id: unverifiedUsersTable.id })
    )[0];
  } catch (error) {
    logger.error("Failed to verify user:", error);

    throw error;
  }
}

export async function getUnverifiedUserCredentialsByEmail(email: string) {
  try {
    return (
      await db
        .select({
          id: unverifiedUsersTable.id,
          verificationCodeHash: unverifiedUsersTable.verificationCodeHash,
          username: unverifiedUsersTable.username,
          isVerified: unverifiedUsersTable.isVerified,
        })
        .from(unverifiedUsersTable)
        .where(eq(unverifiedUsersTable.email, email.toLowerCase()))
        .limit(1)
    )[0];
  } catch (error) {
    logger.error("Failed to get user:", error);

    throw error;
  }
}

export async function cleanupUnverifiedUser(email: string) {
  try {
    return await db
      .delete(unverifiedUsersTable)
      .where(eq(unverifiedUsersTable.email, email.toLowerCase()));
  } catch (error) {
    logger.error("Failed to get user:", error);
    throw error;
  }
}
