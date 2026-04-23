import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendMail.js";

export const adminLoginWithOtp = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // 🔢 Generate Email OTP
  const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.loginOtpEmail = crypto
    .createHash("sha256")
    .update(emailOtp)
    .digest("hex");

  admin.otpExpire = Date.now() + 5 * 60 * 1000;
  await admin.save();

  // 📧 Send OTP via Email
  await sendMail({
    to: admin.email,
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
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Admin Portal</p>
          </div>

          <!-- Content -->
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

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Admin OTP Code</p>
              <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; min-width: 200px;">
                <span style="color: #d4af37; font-size: 36px; font-weight: 600; letter-spacing: 8px; font-family: 'Courier New', monospace;">${emailOtp}</span>
              </div>
            </div>

            <!-- Instructions -->
            <div style="background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Instructions</p>
              <p style="margin: 5px 0; color: #666666; font-size: 15px; line-height: 1.5;">
                1. Enter this OTP in the admin login verification field<br>
                2. The code will expire in 5 minutes<br>
                3. Do not share this admin code with anyone
              </p>
            </div>

            <!-- Security Note -->
            <div style="background-color: #fff9e6; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #f0e6d2;">
              <p style="margin: 0; color: #8b6914; font-size: 14px; line-height: 1.5; text-align: center;">
                <strong>Security Notice:</strong> PARIVA Jewellery will never ask for your admin OTP via phone or email. If you didn't request this OTP, please secure your admin account immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
            <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px; font-weight: 300; letter-spacing: 2px;">PARIVA Jewellery</p>
            <p style="margin: 5px 0; color: #888888; font-size: 13px;">Admin Portal</p>
            <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #e8e8e8;">
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                © 2024 PARIVA Jewellery. All rights reserved.
              </p>
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                Contact: admin@parivajewellery.com | +91 98765 43210
              </p>
            </div>
          </div>

        </div>
      </body>
      </html>
    `
  });

  res.json({ message: "OTP sent to email" });
};
export const verifyAdminOtp = async (req, res) => {
  const { email, emailOtp } = req.body;

  const hashedOtp = crypto
    .createHash("sha256")
    .update(emailOtp)
    .digest("hex");

  const admin = await Admin.findOne({
    email,
    loginOtpEmail: hashedOtp,
    otpExpire: { $gt: Date.now() },
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  admin.loginOtpEmail = undefined;
  admin.otpExpire = undefined;
  await admin.save();

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // 📧 Send Admin Login Confirmation Email
  const loginTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  await sendMail({
    to: admin.email,
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
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Admin Portal</p>
          </div>

          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 28px; font-weight: 400; text-align: center;">Admin Login Successful</h2>
            
            <div style="background-color: #fafafa; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #d4af37;">
              <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                You have successfully logged in to the PARIVA Jewellery admin panel.
              </p>
              <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                If this was you, no action is required.
              </p>
            </div>

            <!-- Login Details -->
            <div style="background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Login Details</p>
              <p style="margin: 5px 0; color: #666666; font-size: 15px;">
                <strong>Date & Time:</strong> ${loginTime}
              </p>
              <p style="margin: 5px 0; color: #666666; font-size: 15px;">
                <strong>Admin Account:</strong> ${admin.email}
              </p>
              <p style="margin: 5px 0; color: #666666; font-size: 15px;">
                <strong>Access Level:</strong> Administrator
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="http://localhost:5173/admin/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 500; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                Go to Admin Dashboard
              </a>
            </div>

            <!-- Security Note -->
            <div style="background-color: #fff9e6; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #f0e6d2;">
              <p style="margin: 0; color: #8b6914; font-size: 14px; line-height: 1.5; text-align: center;">
                <strong>Security Notice:</strong> If this wasn't you, please secure your admin account immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
            <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px; font-weight: 300; letter-spacing: 2px;">PARIVA Jewellery</p>
            <p style="margin: 5px 0; color: #888888; font-size: 13px;">Admin Portal</p>
            <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #e8e8e8;">
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                © 2024 PARIVA Jewellery. All rights reserved.
              </p>
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                Contact: admin@parivajewellery.com | +91 98765 43210
              </p>
            </div>
          </div>

        </div>
      </body>
      </html>
    `
  });

  res
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
};
