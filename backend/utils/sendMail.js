import nodemailer from "nodemailer";

let transporterPromise;

const normalizeEnvValue = (value = "") => String(value).trim();
const normalizePassword = (value = "") => String(value).replace(/\s+/g, "");
const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).trim().toLowerCase() === "true";
};
const normalizePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeRecipient = (value = "") =>
  String(value)
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join(", ");

const getMailEnv = () => {
  const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
  const emailPass = normalizePassword(process.env.EMAIL_PASS);

  if (!emailUser || !emailPass) {
    throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  return {
    emailUser,
    emailPass,
    smtpService: normalizeEnvValue(process.env.SMTP_SERVICE) || "gmail",
    smtpHost: normalizeEnvValue(process.env.SMTP_HOST),
    smtpPort: normalizePort(process.env.SMTP_PORT, 587),
    smtpSecure: normalizeBoolean(process.env.SMTP_SECURE, false),
  };
};

const createTransporter = async () => {
  const { emailUser, emailPass, smtpService, smtpHost, smtpPort, smtpSecure } = getMailEnv();
  const configKey = `${smtpService}:${smtpHost || "default-host"}:${smtpPort}:${smtpSecure}`;

  console.log(`[mail] Trying config: ${configKey}`);

  const transporter = nodemailer.createTransport({
    service: smtpService,
    ...(smtpHost ? { host: smtpHost } : {}),
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
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
  const normalizedTo = normalizeRecipient(to);
  const { emailUser } = getMailEnv();
  const transporter = await getTransporter();

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
