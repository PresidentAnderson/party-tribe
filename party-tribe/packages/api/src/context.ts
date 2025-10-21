import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";

import { db } from "@party-tribe/db";
import { authOptions } from "./auth";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions): Promise<{
  session: Session | null;
  db: typeof db;
}> => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerSession(req, res, authOptions);

  return createInnerTRPCContext({
    session,
  });
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;