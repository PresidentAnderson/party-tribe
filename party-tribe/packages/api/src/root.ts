import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { eventRouter } from "./routers/event";
import { tribeRouter } from "./routers/tribe";

export const appRouter = createTRPCRouter({
  user: userRouter,
  event: eventRouter,
  tribe: tribeRouter,
});

export type AppRouter = typeof appRouter;