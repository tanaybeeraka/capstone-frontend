import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Express 5 forwards errors thrown in async handlers here automatically.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = issue?.path.join(".");
    res.status(400).json({ message: field ? `${field}: ${issue.message}` : (issue?.message ?? "Invalid request.") });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Something went wrong on our side. Please try again." });
}
