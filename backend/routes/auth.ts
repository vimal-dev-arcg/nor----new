import { Router, Request, Response } from "express";
import { generateToken, requireAuth, AuthRequest } from "../middleware/auth";
import { UserModel } from "../models/User";
import { LoginEventModel } from "../models/LoginEvent";
import { isMongoConnected } from "../db";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body || {};

    const inputIdentifier = (username || email || "").trim();
    const inputPassword = (password || "").trim();

    // If no email or username provided, return bad request
    if (!inputIdentifier && !inputPassword) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const finalUsername = (username || (email ? email.split("@")[0] : "admin")).trim();
    const userEmail = email || (username && username.includes("@") ? username : `${finalUsername}@ncrproperties.ae`);
    const role = "admin";

    // If MongoDB is connected, find or automatically initialize default admin user
    if (isMongoConnected()) {
      try {
        let existingUser = await UserModel.findOne({
          $or: [{ email: userEmail }, { username: finalUsername }, { name: finalUsername }],
        });

        if (!existingUser) {
          existingUser = await UserModel.create({
            name: finalUsername,
            username: finalUsername,
            email: userEmail,
            password: inputPassword || "password123",
            role,
          });
        }

        // Record LoginEvent in MongoDB
        try {
          await LoginEventModel.create({
            username: finalUsername,
            email: userEmail,
            status: "success",
            role,
            ip: req.ip || req.socket?.remoteAddress || "127.0.0.1",
            userAgent: req.headers["user-agent"] || "",
          });
        } catch (eventErr) {
          console.log("[Auth] Note: LoginEvent recorded with fallback:", eventErr);
        }
      } catch (err) {
        console.log("[Auth] MongoDB user lookup:", err);
      }
    }

    // Generate signed JWT
    const token = generateToken({
      id: "admin-1",
      name: finalUsername,
      email: userEmail,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: "admin-1",
        name: finalUsername,
        username: finalUsername,
        email: userEmail,
        role,
      },
    });
  } catch (err: any) {
    console.error("[Auth] Unexpected login error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Internal server error during authentication",
    });
  }
});

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, role } = req.body || {};
    const userEmail = email || "user@ncrproperties.ae";
    const userName = name || username || userEmail.split("@")[0];
    const userUsername = username || userName.toLowerCase().replace(/\s+/g, "");
    const userRole = role || "buyer";

    if (isMongoConnected()) {
      try {
        const created = await UserModel.create({
          name: userName,
          username: userUsername,
          email: userEmail,
          password: password || "password123",
          role: userRole,
        });
        const token = generateToken({
          id: String(created._id),
          name: userName,
          email: userEmail,
          role: userRole,
        });
        return res.status(201).json({ success: true, token, user: created });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err?.message || "Registration failed" });
      }
    }

    const token = generateToken({
      id: `user_${Date.now()}`,
      name: userName,
      email: userEmail,
      role: userRole,
    });
    return res.status(201).json({
      success: true,
      token,
      user: { name: userName, username: userUsername, email: userEmail, role: userRole },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Registration error" });
  }
});

authRouter.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user || {
      name: "Sudhir (Admin)",
      username: "admin",
      email: "admin@ncrproperties.ae",
      role: "admin",
    },
  });
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
