import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, text ,html,attachments  }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PARIVA Jewellery" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
};
