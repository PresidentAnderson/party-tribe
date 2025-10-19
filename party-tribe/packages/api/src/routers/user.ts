import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
          verified: true,
          isOrganizer: true,
          createdAt: true,
          tribes: {
            include: {
              tribe: true,
            },
          },
          events: {
            where: {
              status: "PUBLISHED",
              isPublic: true,
            },
            orderBy: {
              startDate: "desc",
            },
            take: 6,
          },
          _count: {
            select: {
              events: true,
              attendances: true,
              tribes: true,
            },
          },
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  becomeOrganizer: protectedProcedure
    .mutation(({ ctx }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { isOrganizer: true },
      });
    }),

  getMyProfile: protectedProcedure
    .query(({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          tribes: {
            include: {
              tribe: true,
            },
          },
          events: {
            orderBy: {
              startDate: "desc",
            },
          },
          attendances: {
            include: {
              event: true,
            },
            orderBy: {
              registeredAt: "desc",
            },
          },
        },
      });
    }),
});