import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const tribeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search } = input;

      const tribes = await ctx.db.tribe.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          isPrivate: false,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (tribes.length > limit) {
        const nextItem = tribes.pop();
        nextCursor = nextItem!.id;
      }

      return {
        tribes,
        nextCursor,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.tribe.findUnique({
        where: { slug: input.slug },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                  verified: true,
                },
              },
            },
            orderBy: {
              joinedAt: "asc",
            },
          },
          events: {
            where: {
              status: "PUBLISHED",
              isPublic: true,
            },
            include: {
              organizer: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  attendances: true,
                },
              },
            },
            orderBy: {
              startDate: "asc",
            },
            take: 10,
          },
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50),
        description: z.string().max(1000).optional(),
        avatar: z.string().url().optional(),
        banner: z.string().url().optional(),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tribe = await ctx.db.tribe.create({
        data: input,
      });

      // Add creator as admin
      await ctx.db.tribeMembership.create({
        data: {
          userId: ctx.session.user.id,
          tribeId: tribe.id,
          role: "ADMIN",
        },
      });

      return tribe;
    }),

  join: protectedProcedure
    .input(z.object({ tribeId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.tribeMembership.create({
        data: {
          userId: ctx.session.user.id,
          tribeId: input.tribeId,
          role: "MEMBER",
        },
      });
    }),

  leave: protectedProcedure
    .input(z.object({ tribeId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.tribeMembership.delete({
        where: {
          userId_tribeId: {
            userId: ctx.session.user.id,
            tribeId: input.tribeId,
          },
        },
      });
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        tribeId: z.string(),
        userId: z.string(),
        role: z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is admin of this tribe
      const currentUserMembership = await ctx.db.tribeMembership.findUnique({
        where: {
          userId_tribeId: {
            userId: ctx.session.user.id,
            tribeId: input.tribeId,
          },
        },
      });

      if (!currentUserMembership || currentUserMembership.role !== "ADMIN") {
        throw new Error("Only tribe admins can change member roles");
      }

      return ctx.db.tribeMembership.update({
        where: {
          userId_tribeId: {
            userId: input.userId,
            tribeId: input.tribeId,
          },
        },
        data: {
          role: input.role,
        },
      });
    }),

  getMyTribes: protectedProcedure
    .query(({ ctx }) => {
      return ctx.db.tribeMembership.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          tribe: {
            include: {
              _count: {
                select: {
                  members: true,
                  events: true,
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: "desc",
        },
      });
    }),
});