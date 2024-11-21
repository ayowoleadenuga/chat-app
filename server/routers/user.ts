import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  signin: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.upsert({
          where: { username: input.username },
          update: {},
          create: { username: input.username },
          select: {
            id: true,
            username: true,
          },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sign in",
        });
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),
});
