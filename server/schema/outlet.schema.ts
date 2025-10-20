import { z } from "zod";

export const createOutletRequest = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
});

export const updateOutletRequest = z.object({
  id: z.string().uuid("Invalid outlet ID"),
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
});

export const outletResponse = z.object({
  id: z.string().uuid("Invalid outlet ID"),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
});

export type CreateOutletRequest = z.infer<typeof createOutletRequest>;
export type UpdateOutletRequest = z.infer<typeof updateOutletRequest>;
export type OutletResponse = z.infer<typeof outletResponse>;
