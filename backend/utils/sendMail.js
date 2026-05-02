import nodemailer from "nodemailer";

let transporterPromise;

const normalizeEnvValue = (value = "") => String(value).trim();
const normalizePassword = (value = "") => String(value).replace(/\s+/g, "");

const normalizeRecipient = (value = "") =>
  String(value)
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join(", ");

const createTransporter = async () => {
  const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
  const emailPass = normalizePassword(process.env.EMAIL_PASS);

  if (!emailUser || !emailPass) {
    throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });

  return transporter;
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = undefined;
      throw error;
    });
  }

  return transporterPromise;
};

export const sendMail = async ({ to, subject, text, html, attachments }) => {
  const transporter = await getTransporter();
  const normalizedTo = normalizeRecipient(to);
  const emailUser = normalizeEnvValue(process.env.EMAIL_USER);

  if (!normalizedTo) {
    throw new Error("Recipient email address is missing.");
  }

  try {
    await transporter.sendMail({
      from: `"PARIVA Jewellery" <${emailUser}>`,
      to: normalizedTo,
      subject,
      text,
      html,
      attachments,
    });
  } catch (error) {
    transporterPromise = undefined;
    throw new Error(
      `Mail send failed: ${error?.response || error?.code || error?.message || "Unknown error"}`
    );
  }
};
