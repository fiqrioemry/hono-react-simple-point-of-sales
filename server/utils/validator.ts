import { z } from "zod";
import { ZodSchema } from "zod";
import { Context } from "hono";

export const validate = (schema: ZodSchema, data: any) => {
  const result = schema.safeParse(data);

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

export async function parseForm<T>(
  c: Context,
  schema: z.ZodSchema<T>
): Promise<T> {
  const form = (await c.req.formData()) as any;
  const raw: Record<string, any> = {};

  for (const [key, value] of form.entries()) {
    if (raw[key]) {
      if (Array.isArray(raw[key])) raw[key].push(value);
      else raw[key] = [raw[key], value];
    } else {
      raw[key] = value;
    }
  }

  return schema.parse(raw);
}
