import { Router, Request, Response } from "express";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { username, email, password } = req.body || {};
  
  // Standard session generation for NCR administrative portal
  const token = "ncr_admin_session_token_" + Buffer.from(username || email || "admin").toString("base64");
  
  return res.status(200).json({
    success: true,
    token,
    user: {
      name: username || "Sudhir (Admin)",
      email: email || "admin@ncrproperties.ae",
      role: "admin",
    },
  });
});

authRouter.get("/me", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: {
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
