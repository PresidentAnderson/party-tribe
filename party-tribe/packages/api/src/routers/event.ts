import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, organizerProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        search: z.string().optional(),
        tribeSlug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, tribeSlug } = input;

      const events = await ctx.db.event.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          status: "PUBLISHED",
          isPublic: true,
          ...(search && {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(tribeSlug && {
            tribe: {
              slug: tribeSlug,
            },
          }),
        },
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          tribe: {
            select: {
              id: true,
              name: true,
              slug: true,
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
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (events.length > limit) {
        const nextItem = events.pop();
        nextCursor = nextItem!.id;
      }

      return {
        events,
        nextCursor,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findUnique({
        where: { slug: input.slug },
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          tribe: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
            },
          },
          attendances: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });
    }),

  create: organizerProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        location: z.string().optional(),
        venue: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        timezone: z.string().default("UTC"),
        capacity: z.number().int().positive().optional(),
        price: z.number().nonnegative().optional(),
        currency: z.string().default("USD"),
        isPublic: z.boolean().default(true),
        coverImage: z.string().url().optional(),
        tribeId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          ...input,
          organizerId: ctx.session.user.id,
          status: "DRAFT",
        },
      });
    }),

  update: organizerProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        venue: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        capacity: z.number().int().positive().optional(),
        price: z.number().nonnegative().optional(),
        isPublic: z.boolean().optional(),
        coverImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if user owns this event
      const event = await ctx.db.event.findUnique({
        where: { id },
        select: { organizerId: true },
      });

      if (!event || event.organizerId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db.event.update({
        where: { id },
        data,
      });
    }),

  publish: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns this event
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        select: { organizerId: true },
      });

      if (!event || event.organizerId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db.event.update({
        where: { id: input.id },
        data: { status: "PUBLISHED" },
      });
    }),

  attend: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        status: z.enum(["GOING", "MAYBE", "NOT_GOING"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.eventAttendance.upsert({
        where: {
          userId_eventId: {
            userId: ctx.session.user.id,
            eventId: input.eventId,
          },
        },
        update: {
          status: input.status,
        },
        create: {
          userId: ctx.session.user.id,
          eventId: input.eventId,
          status: input.status,
        },
      });
    }),

  getMyEvents: organizerProcedure
    .query(({ ctx }) => {
      return ctx.db.event.findMany({
        where: {
          organizerId: ctx.session.user.id,
        },
        include: {
          tribe: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});