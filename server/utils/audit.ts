import { prisma } from "@/config/database";

export async function auditLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  meta: any
) {
  await prisma.auditLog.create({
    data: {
      userId: userId,
      action,
      entity,
      entityId,
      meta,
    },
  });
}
