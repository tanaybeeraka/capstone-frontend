import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { HttpError } from "./errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function signToken(userId: string): string {
  return jwt.sign({}, config.jwtSecret, { subject: userId, expiresIn: "7d" });
}

/** Rejects the request unless it carries a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new HttpError(401, "Please sign in.");
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (typeof payload === "string" || !payload.sub) throw new Error("bad payload");
    req.userId = payload.sub;
  } catch {
    throw new HttpError(401, "Your session expired. Please sign in again.");
  }
  next();
}

export function currentUserId(req: Request): string {
  if (!req.userId) throw new HttpError(401, "Please sign in.");
  return req.userId;
}
