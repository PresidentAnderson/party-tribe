import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export * from "@prisma/client";
export type { 
  User,
  Account,
  Session,
  VerificationToken,
  Tribe,
  TribeMembership,
  Event,
  EventAttendance,
  TribeRole,
  EventStatus,
  AttendanceStatus
} from "@prisma/client";