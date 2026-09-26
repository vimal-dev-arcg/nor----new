import { Router, Request, Response } from "express";
import { generateToken, requireAuth, AuthRequest } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { username, email, password } = req.body || {};
  const userEmail = email || "admin@ncrproperties.ae";
  const userName = username || (email ? email.split("@")[0] : "Sudhir (Admin)");
  const role = "admin";

  // Generate signed token
  const token = generateToken({
    id: "admin-1",
    name: userName,
    email: userEmail,
    role,
  });

  return res.status(200).json({
    success: true,
    token,
    user: {
      name: userName,
      email: userEmail,
      role,
    },
  });
});

authRouter.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user || {
      name: "Sudhir (Admin)",
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
