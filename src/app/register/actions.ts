"use server";

import nodemailer from "nodemailer";
import { EMAIL } from "@/content";
import { emailFor, mailtoFor, readRegistration, type RegisterState } from "@/lib/registration";

/**
 * Receives the pre-registration form and emails it to the team.
 *
 * The mail goes out through the team's own mailbox (SMTP_USER and SMTP_PASS, set on the
 * host, never in the code), addressed to the team, with the visitor as "Reply-To": the
 * team answers by pressing Reply. Nothing is stored, and no mail is sent to the visitor,
 * so the form cannot be used to send mail to a stranger.
 *
 * If the mail cannot be sent, the visitor keeps their answers and gets a link that sends
 * the same message from their own email, so an entry is never lost quietly.
 */
export async function register(_previous: RegisterState, form: FormData): Promise<RegisterState> {
  // A hidden field no person can see. Whatever fills it is a bot: say thanks and send nothing.
  if (form.get("website")) return { status: "sent" };

  const { values, errors } = readRegistration(form);
  if (Object.keys(errors).length) return { status: "invalid", values, errors };

  const unsent: RegisterState = { status: "unsent", values, errors: {}, mailto: mailtoFor(values) };
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error("register: SMTP_USER or SMTP_PASS is not set, so the form cannot send");
    return unsent;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  try {
    await mailer.sendMail({
      from: { name: "Pramana AI website", address: user },
      to: process.env.REGISTER_TO ?? EMAIL,
      replyTo: { name: values.name, address: values.email },
      ...emailFor(values),
    });
    return { status: "sent" };
  } catch (error) {
    // The code only: the message can echo addresses, and personal details stay out of the logs.
    console.error("register: the mail server refused the message:", (error as { code?: string }).code ?? "unknown");
    return unsent;
  }
}
