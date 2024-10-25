import { env } from "@/env.mjs";
import { Resend } from "resend";
import { z } from "zod";
import logger from "../logger";

const apiKey = env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export const emailOptionsSchema = z.object({
  /** \<this_part_of_an_email\>@example.com */
  fromEmailUsername: z.string().default("whatever"),
  fromEmailDomain: z.string().default("telford.lol"),
  to: z.union([z.string().min(1).email(), z.array(z.string().min(1).email())]),
  subject: z.string().min(1),
  /** The HTML content of the email. */
  body: z.string(),
  /** Redirect replies to this address */
  replyTo: z
    .union([z.string().min(1).email(), z.array(z.string().min(1).email())])
    .optional(),
});

// type EmailOptions = z.infer<typeof emailOptionsSchema>;
type EmailOptionsInput = z.input<typeof emailOptionsSchema>;

export async function sendEmail({
  fromEmailUsername,
  fromEmailDomain,
  replyTo,
  to,
  subject,
  body,
}: EmailOptionsInput) {
  try {
    const validatedEmailOptions = emailOptionsSchema.parse({
      to,
      subject,
      body,
      fromEmailUsername,
      fromEmailDomain,
      replyTo,
    });

    return await resend.emails.send({
      from: `${validatedEmailOptions.fromEmailUsername}@${validatedEmailOptions.fromEmailDomain}`,
      // redirect all emails to this address
      replyTo: validatedEmailOptions.replyTo,
      to: validatedEmailOptions.to,
      subject: validatedEmailOptions.subject,
      html: validatedEmailOptions.body,
    });
  } catch (error) {
    logger.error(error);

    throw new Error("Error sending email.");
  }
}
