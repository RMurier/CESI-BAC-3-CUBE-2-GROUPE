import { Request, Response, NextFunction } from "express";
import { User, Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId?: string;
    sessionClaims?: Record<string, any>;
  };
  dbUser?: User & { role: Role };
  userRole?: string;
}

export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Record<string, any>;

export type RoleCheckFunction = (allowedRoles: string[]) => AuthMiddleware;
