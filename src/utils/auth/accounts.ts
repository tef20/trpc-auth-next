import argon2 from "argon2";
import logger from "@/utils/logger";
import crypto from "crypto";
import { sendEmail } from "../email/send-email";

export async function hashPassword(password: string) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  } catch (error) {
    logger.error("Failed to hash password:", error);

    throw error;
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await argon2.verify(hashedPassword, password);
}

export async function generateNonce() {
  try {
    // Generate a secure random 8-digit number
    const min = 10 ** 7;
    const max = 10 ** 8 - 1;
    const range = max - min + 1;

    let randomNumber;
    do {
      // Generate a random 4-byte integer
      randomNumber = crypto.randomBytes(4).readUInt32BE(0);
    } while (randomNumber >= Math.floor(0xffffffff / range) * range);

    // Scale down to the desired range and add the minimum value
    return min + (randomNumber % range);
  } catch (error) {
    logger.error("Failed to generate user verification code:", error);

    throw error;
  }
}

export async function sendWelcomeEmail({
  email,
  username,
}: {
  email: string;
  username: string;
}) {
  return await sendEmail({
    to: email.toLowerCase(),
    subject: "You have signed up!",
    body: `Hello, ${username}!`,
  });
}
