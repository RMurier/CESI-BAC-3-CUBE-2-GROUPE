import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { log } from "console";
import prisma from "../utils/database";

export const checkRole = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { auth } = req;
      console.log("roleCheck: reçu");
      if (!auth?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { clerkUserId: auth.userId },
        include: { role: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }

      if (!user.isActivated) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      const userRole = user.role.name;
      const hasPermission = allowedRoles.includes(userRole);

      if (!hasPermission) {
        return res.status(403).json({
          error: "Insufficient permissions",
          required: allowedRoles,
          userRole: userRole,
        });
      }

      req.dbUser = user;
      req.userRole = userRole;

      next();
    } catch (error) {
      console.error("Role validation error:", error);
      return res.status(500).json({ error: "Role validation failed" });
    }
  };
};
