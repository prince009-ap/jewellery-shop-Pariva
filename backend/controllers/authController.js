import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../utils/sendMail.js";
import { buildClientUrl } from "../utils/appUrl.js";

const generateToken = (id, role = "user") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, mobile, dob, gender } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // 1️⃣ Validation
    if (!name || !normalizedEmail || !mobile || !password || !dob || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ User exists check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3️⃣ Create user (password will be hashed via User model middleware)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      mobile,
      dob,
      gender,
      role: "user"
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* LOGIN – ROLE ENFORCED */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email: normalizedEmail, role });
    if (!user) return res.status(401).json({ message: "Access denied" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

 res
  .cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  .json({
    token,
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });


  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail, role });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = buildClientUrl(`/reset-password/${resetToken}`);

    await sendMail({
      to: user.email,
      subject: "Reset Your Password - PARIVA Jewellery",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - PARIVA Jewellery</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f8f8f8;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
            <div style="background:linear-gradient(135deg,#d4af37 0%,#f4e4bc 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:300;letter-spacing:3px;">PARIVA</h1>
              <p style="margin:8px 0 0;color:#ffffff;font-size:14px;opacity:0.9;">Fine Jewellery</p>
            </div>

            <div style="padding:44px 36px;">
              <h2 style="margin:0 0 18px;color:#333333;font-size:28px;font-weight:400;text-align:center;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#666666;font-size:16px;line-height:1.7;text-align:center;">
                We received a request to reset your PARIVA account password. Click the button below to continue.
              </p>

              <div style="text-align:center;margin:34px 0;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#111111 0%,#2c2118 100%);color:#f8f2e8;text-decoration:none;padding:16px 34px;border-radius:999px;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;">
                  Reset Password
                </a>
              </div>

              <div style="background:#faf7f2;border:1px solid #eadfcf;border-radius:12px;padding:18px 20px;margin:24px 0;">
                <p style="margin:0;color:#7a6b5c;font-size:14px;line-height:1.7;">
                  This link will expire in 15 minutes. If the button does not work, copy and paste this URL into your browser:
                </p>
                <p style="margin:12px 0 0;word-break:break-all;color:#9a7740;font-size:13px;">${resetUrl}</p>
              </div>

              <p style="margin:0;color:#8b6914;font-size:14px;line-height:1.6;text-align:center;">
                If you did not request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.json({
      message: "Reset link sent to your email",
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message:
        "Unable to send reset email. Please check mail settings and try again.",
    });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Unable to reset password" });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, dob, gender } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = new Date(dob);
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        gender: user.gender,
        role: user.role,
        createdAt: user.createdAt,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // prod me true
  });

  res.json({ message: "Logged out successfully" });
};



export const loginWithPasswordAndOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password. If you forgot it, use Forgot Password to reset." });
    }

  // 🔢 Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.loginOtp = crypto.createHash("sha256").update(otp).digest("hex");
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendMail({
    to: user.email,
    subject: "Your Login OTP - PARIVA Jewellery",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login OTP - PARIVA Jewellery</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Fine Jewellery</p>
          </div>

          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 28px; font-weight: 400; text-align: center;">Your Login OTP</h2>
            
            <div style="background-color: #fafafa; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #d4af37;">
              <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Use the following One-Time Password to complete your login to PARIVA Jewellery.
              </p>
              <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                This OTP is valid for 5 minutes only.
              </p>
            </div>

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); border-radius: 12px; padding: 30px; margin: 30px ; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your OTP Code</p>
              <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; min-width: 200px;">
                <span style="color: #d4af37; font-size: 36px; font-weight: 600; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
            </div>

            <!-- Instructions -->
            <div style="background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Instructions</p>
              <p style="margin: 5px 0; color: #666666; font-size: 15px; line-height: 1.5;">
                1. Enter this OTP in the login verification field<br>
                2. The code will expire in 5 minutes<br>
                3. Do not share this code with anyone
              </p>
            </div>

            <!-- Security Note -->
            <div style="background-color: #fff9e6; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #f0e6d2;">
              <p style="margin: 0; color: #8b6914; font-size: 14px; line-height: 1.5; text-align: center;">
                <strong>Security Notice:</strong> PARIVA Jewellery will never ask for your OTP via phone or email. If you didn't request this OTP, please secure your account immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
            <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px; font-weight: 300; letter-spacing: 2px;">PARIVA Jewellery</p>
            <p style="margin: 5px 0; color: #888888; font-size: 13px;">Excellence in Every Facet</p>
            <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #e8e8e8;">
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                © 2024 PARIVA Jewellery. All rights reserved.
              </p>
              <p style="margin: 5px 0; color: #666666; font-size: 12px;">
                Contact: senjaliyaprince009@gmail.com | +91 97149 07350
              </p>
            </div>
          </div>

        </div>
      </body>
      </html>
    `
  });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Login with password & OTP error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // VALIDATION: Check required fields
    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Email and OTP are required",
        missing: !email ? "email" : "otp"
      });
    }

    // VALIDATION: Check OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ 
        message: "OTP must be 6 digits",
        received: otp
      });
    }

    // VALIDATION: Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        received: email
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      loginOtp: hashedOtp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired OTP",
        hint: "Please check your email for the correct OTP or request a new one"
      });
    }

    // Clear OTP fields
    user.loginOtp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send Login Confirmation Email
    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const accountUrl = buildClientUrl("/account");

    // Send confirmation email (fire and forget, don't block response)
    sendMail({
      to: user.email,
      subject: "Login Successful - PARIVA Jewellery",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Successful - PARIVA Jewellery</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Arial, sans-serif; color: #ffffff;">
          <div style="max-width: 600px; margin: 20px auto; background-color: #2a2a2a; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #d4af37;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #d4af37;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: 300; letter-spacing: 3px;">PARIVA</h1>
              <p style="margin: 8px 0 0 0; color: #1a1a1a; font-size: 14px; opacity: 0.9;">Fine Jewellery</p>
            </div>

            <!-- Content -->
            <div style="padding: 50px 40px;">
              <h2 style="margin: 0 0 25px 0; color: #ffffff; font-size: 28px; font-weight: 400; text-align: center;">Login Successful</h2>
              
              <!-- Success Badge -->
              <div style="text-align: center; margin: 35px 0;">
                <div style="display: inline-block; width: 90px; height: 90px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 50%; padding: 25px; box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);">
                  <svg style="width: 40px; height: 40px; fill: #ffffff;" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>

              <!-- Message -->
              <div style="background-color: #333333; border-radius: 12px; padding: 30px; margin: 35px 0; border-left: 4px solid #4caf50;">
                <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 16px; line-height: 1.6; font-weight: 500;">
                  Hello ${user.name || 'Valued Customer'},
                </p>
                <p style="margin: 0; color: #cccccc; font-size: 16px; line-height: 1.6;">
                  You have successfully logged in to your jewellery account.
                  If this was you, no action is required.
                </p>
              </div>

              <!-- Login Details -->
              <div style="background-color: #333333; border-radius: 12px; padding: 25px 30px; margin: 30px 0; border: 1px solid #444444;">
                <p style="margin: 0 0 15px 0; color: #d4af37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Login Details</p>
                <p style="margin: 8px 0; color: #cccccc; font-size: 15px;">
                  <strong style="color: #d4af37;">Date & Time:</strong> ${loginTime}
                </p>
                <p style="margin: 8px 0; color: #cccccc; font-size: 15px;">
                  <strong style="color: #d4af37;">Account:</strong> ${user.email}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${accountUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1a1a1a; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); transition: all 0.3s ease;">
                  Go to My Account
                </a>
              </div>

              <!-- Security Note -->
              <div style="text-align: center; padding: 25px; background-color: #2a2a2a; border-radius: 12px; border: 1px solid #d4af37;">
                <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong>Security Notice:</strong> If this wasn't you, please secure your account immediately.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #1a1a1a; padding: 30px 40px; text-align: center; border-top: 2px solid #d4af37;">
              <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px; font-weight: 300; letter-spacing: 2px;">PARIVA Jewellery</p>
              <p style="margin: 5px 0; color: #cccccc; font-size: 13px;">Excellence in Every Facet</p>
              <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #444444;">
                <p style="margin: 5px 0; color: #999999; font-size: 12px;">
                  2024 PARIVA Jewellery. All rights reserved.
                </p>
                <p style="margin: 5px 0; color: #999999; font-size: 12px;">
                  Contact: senjaliyaprince009@gmail.com | +91 97149 07350
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(err => {
      console.error("Failed to send login confirmation email:", err);
      // Don't fail the login if email fails
    });

    // Return success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login with password & OTP error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
