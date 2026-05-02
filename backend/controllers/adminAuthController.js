import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendMail.js";
import { buildClientUrl } from "../utils/appUrl.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findAdminByEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  const directAdmin = await Admin.findOne({ email: normalizedEmail });
  if (directAdmin) return directAdmin;

  return Admin.findOne({
    email: {
      $regex: `^\\s*${escapeRegex(normalizedEmail)}\\s*$`,
      $options: "i",
    },
  });
};

const buildAdminToken = (adminId) =>
  jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const adminLoginWithOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(String(password || ""), admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const recipientEmail = String(admin.email || "").trim().toLowerCase();

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.loginOtpEmail = crypto.createHash("sha256").update(emailOtp).digest("hex");
    admin.otpExpire = Date.now() + 5 * 60 * 1000;
    await admin.save({ validateBeforeSave: false });

    const otpMailPayload = {
      to: recipientEmail,
      subject: "Admin Login OTP - PARIVA Jewellery",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Login OTP - PARIVA Jewellery</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Admin Portal</p>
            </div>
            <div style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 28px; font-weight: 400; text-align: center;">Admin Login OTP</h2>
              <div style="background-color: #fafafa; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #d4af37;">
                <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Use the following One-Time Password to complete your admin login to PARIVA Jewellery.
                </p>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  This OTP is valid for 5 minutes only.
                </p>
              </div>
              <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Admin OTP Code</p>
                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; min-width: 200px;">
                  <span style="color: #d4af37; font-size: 36px; font-weight: 600; letter-spacing: 8px; font-family: 'Courier New', monospace;">${emailOtp}</span>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sendMail(otpMailPayload);

      return res.json({
        message: "OTP sent to email",
        otpRequired: true,
      });
    } catch (mailError) {
      console.error("Admin OTP email failed, using demo OTP delivery:", mailError);

      return res.status(200).json({
        message: "Admin email service is unavailable right now. Use the OTP shown below to continue login.",
        otpRequired: true,
        deliveryMode: "demo",
        demoOtp: emailOtp,
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyAdminOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const emailOtp = String(req.body.emailOtp || "").trim();
    const hashedOtp = crypto.createHash("sha256").update(emailOtp).digest("hex");

    const admin =
      (await Admin.findOne({
        email: normalizedEmail,
        loginOtpEmail: hashedOtp,
        otpExpire: { $gt: Date.now() },
      })) ||
      (await Admin.findOne({
        email: {
          $regex: `^\\s*${escapeRegex(normalizedEmail)}\\s*$`,
          $options: "i",
        },
        loginOtpEmail: hashedOtp,
        otpExpire: { $gt: Date.now() },
      }));

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.loginOtpEmail = undefined;
    admin.otpExpire = undefined;
    await admin.save({ validateBeforeSave: false });

    const token = buildAdminToken(admin._id);
    const loginTime = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const adminDashboardUrl = buildClientUrl("/admin/dashboard");

    sendMail({
      to: String(admin.email || "").trim().toLowerCase(),
      subject: "Admin Login Successful - PARIVA Jewellery",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Login Successful - PARIVA Jewellery</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Admin Portal</p>
            </div>
            <div style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 28px; font-weight: 400; text-align: center;">Admin Login Successful</h2>
              <div style="background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Login Details</p>
                <p style="margin: 5px 0; color: #666666; font-size: 15px;"><strong>Date & Time:</strong> ${loginTime}</p>
                <p style="margin: 5px 0; color: #666666; font-size: 15px;"><strong>Admin Account:</strong> ${admin.email}</p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${adminDashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">Go to Admin Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }).catch((mailError) => {
      console.error("Failed to send admin login confirmation email:", mailError);
    });

    return res
      .cookie("adminToken", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      });
  } catch (error) {
    console.error("Admin OTP verification error:", error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
