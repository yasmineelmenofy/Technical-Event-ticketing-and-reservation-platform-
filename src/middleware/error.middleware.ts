import { AppError } from "../utils/AppError.js";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    // AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            type: "AppError",
            message: err.message,
            ...(process.env.NODE_ENV !== "production" && {
                stack: err.stack,
            }),
        });
        return;
    }

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            type: "ValidationError",
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    // PostgreSQL errors
    if (isPostgresError(err)) {

        switch (err.code) {

            case "23505":
                res.status(409).json({
                    success: false,
                    type: "DatabaseError",
                    message: "A record with this value already exists",
                });
                return;

            case "23503":
                res.status(409).json({
                    success: false,
                    type: "DatabaseError",
                    message: "Referenced record does not exist or cannot be deleted",
                });
                return;

            case "23502":
                res.status(400).json({
                    success: false,
                    type: "DatabaseError",
                    message: "A required field is missing",
                });
                return;

            case "23514":
                res.status(400).json({
                    success: false,
                    type: "DatabaseError",
                    message: "A database constraint was violated",
                });
                return;

            case "22P02":
                res.status(400).json({
                    success: false,
                    type: "DatabaseError",
                    message: "Invalid data format",
                });
                return;
        }
    }

    // Unknown error
    res.status(500).json({
        success: false,
        type: "InternalServerError",
        message: "Something went wrong",
        ...(process.env.NODE_ENV !== "production" && {
            stack: err instanceof Error ? err.stack : undefined,
        }),
    });
};

function isPostgresError(
    err: unknown
): err is { code: string } {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
    );
}