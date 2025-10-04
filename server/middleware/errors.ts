import { Context } from "hono";
import { ZodError } from "zod";
import { errorResponse } from "@/utils/response";
import { HTTPException } from "hono/http-exception";

export async function errorHandler(err: Error, c: Context) {
  console.log(err);
  // if error is HTTPException
  if (err instanceof HTTPException) {
    return errorResponse(c, err.message, err.status, "HTTP_EXCEPTION");
  }

  //   if error is ZodError
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return errorResponse(
      c,
      "Validation error",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  //   other errors
  return errorResponse(
    c,
    "Internal Server Error",
    500,
    "INTERNAL_SERVER_ERROR"
  );
}

export async function notFoundHandler(c: Context) {
  return errorResponse(c, `${c.req.method} - ${c.req.url}`, 404, "NOT_FOUND");
}
