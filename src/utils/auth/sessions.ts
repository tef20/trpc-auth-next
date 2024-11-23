import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";
import { and, eq, gt, not } from "drizzle-orm";
import logger from "@/utils/logger";

export function calculateSessionExpiryTime(
  type: "access" | "refresh" | "pendingVerification",
) {
  const now = Date.now();
  const sessionDuration = getTokenExpiryTimeOffset(type);

  const sessionExpiry = new Date(now + sessionDuration);

  return sessionExpiry.getTime();
}

export function getTokenExpiryTimeOffset(
  type: "access" | "refresh" | "pendingVerification",
) {
  switch (type) {
    case "refresh":
      return 7 * 24 * 60 * 60 * 1000;
    case "pendingVerification":
      return 30 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
}

export async function createSession(userId: string) {
  try {
    return (
      await db
        .insert(sessionsTable)
        .values({
          userId: userId,
          expiresAt: calculateSessionExpiryTime("refresh"),
        })
        .returning({
          id: sessionsTable.id,
          expiresAt: sessionsTable.expiresAt,
        })
    )[0];
  } catch (error) {
    logger.error("Failed to create session:", error);
    throw error;
  }
}

export async function renewSession(sessionId: string, userId: string) {
  if (await isSessionValid(sessionId, userId)) {
    await invalidateSession(sessionId);

    return await createSession(userId);
  }

  throw new Error("Session is invalid or expired");
}

export async function isSessionValid(sessionId: string, userId: string) {
  try {
    return (
      (
        await db
          .select()
          .from(sessionsTable)
          .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
          .where(
            and(
              eq(sessionsTable.userId, userId),
              eq(sessionsTable.id, sessionId),
              gt(sessionsTable.expiresAt, Date.now()),
              not(eq(sessionsTable.invalid, true)),
            ),
          )
          .limit(1)
      ).length === 1
    );
  } catch (error) {
    logger.error("Failed to validate session:", error);
    throw error;
  }
}

export async function invalidateSession(sessionId: string) {
  logger.log("invalidating session", sessionId);
  try {
    return await db
      .update(sessionsTable)
      .set({ invalid: true })
      .where(eq(sessionsTable.id, sessionId));
  } catch (error) {
    logger.error("Failed to invalidate session:", error);
    throw error;
  }
}
