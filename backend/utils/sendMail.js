import nodemailer from "nodemailer";

let cachedTransporter;
let cachedTransportKey;

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
    smtpHost: normalizeEnvValue(process.env.SMTP_HOST),
    smtpPort: normalizePort(process.env.SMTP_PORT, 587),
    smtpSecure: normalizeBoolean(process.env.SMTP_SECURE, false),
    smtpService: normalizeEnvValue(process.env.SMTP_SERVICE),
  };
};

const buildTransportConfigs = () => {
  const { emailUser, emailPass, smtpHost, smtpPort, smtpSecure, smtpService } = getMailEnv();
  const sharedAuth = {
    user: emailUser,
    pass: emailPass,
  };
  const baseTimeouts = {
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  };

  const configs = [];

  if (smtpHost || smtpService) {
    configs.push({
      key: `custom:${smtpService || smtpHost}:${smtpPort}:${smtpSecure}`,
      options: {
        ...(smtpService ? { service: smtpService } : {}),
        ...(smtpHost ? { host: smtpHost } : {}),
        port: smtpPort,
        secure: smtpSecure,
        requireTLS: !smtpSecure,
        auth: sharedAuth,
        ...baseTimeouts,
      },
    });
  }

  configs.push(
    {
      key: "gmail:587:false",
      options: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: sharedAuth,
        ...baseTimeouts,
      },
    },
    {
      key: "gmail:465:true",
      options: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        requireTLS: true,
        auth: sharedAuth,
        ...baseTimeouts,
      },
    }
  );

  return { emailUser, configs };
};

const buildAttemptList = (configs) => {
  if (!cachedTransportKey) return configs;

  const preferred = configs.find((config) => config.key === cachedTransportKey);
  const remaining = configs.filter((config) => config.key !== cachedTransportKey);
  return preferred ? [preferred, ...remaining] : configs;
};

const getTransporterForConfig = (config) => {
  if (cachedTransporter && cachedTransportKey === config.key) {
    return cachedTransporter;
  }

  return nodemailer.createTransport(config.options);
};

export const sendMail = async ({ to, subject, text, html, attachments }) => {
  const normalizedTo = normalizeRecipient(to);
  const { emailUser, configs } = buildTransportConfigs();

  if (!normalizedTo) {
    throw new Error("Recipient email address is missing.");
  }

  const attempts = [];

  for (const config of buildAttemptList(configs)) {
    const transporter = getTransporterForConfig(config);

    try {
      await transporter.sendMail({
        from: `"PARIVA Jewellery" <${emailUser}>`,
        to: normalizedTo,
        subject,
        text,
        html,
        attachments,
      });

      cachedTransporter = transporter;
      cachedTransportKey = config.key;
      return;
    } catch (error) {
      if (cachedTransportKey === config.key) {
        cachedTransporter = undefined;
        cachedTransportKey = undefined;
      }

      attempts.push(
        `${config.key} -> ${error?.response || error?.code || error?.message || "Unknown error"}`
      );
    }
  }

  throw new Error(`Mail send failed: ${attempts.join(" | ")}`);
};
