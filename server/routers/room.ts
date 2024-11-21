import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { EventEmitter } from "events";

const ee = new EventEmitter();
export const roomRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Verify user exists in context
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view rooms",
        });
      }

      const rooms = await ctx.prisma.chatRoom.findMany({
        include: {
          _count: {
            select: { users: true },
          },
          users: {
            where: {
              userId: ctx.user.id,
            },
            select: {
              userId: true,
            },
          },
        },
      });

      return rooms.map((room) => ({
        ...room,
        isJoined: room.users.some((u) => u.userId === ctx.user.id),
      }));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }),

  join: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the user is already in the room
        const existingMembership = await ctx.prisma.userRoom.findUnique({
          where: {
            userId_roomId: {
              userId: ctx.user.id,
              roomId: input.roomId,
            },
          },
        });

        if (existingMembership) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already a memberrr of this room",
          });
        }

        // If not, create the membership
        const userRoom = await ctx.prisma.userRoom.create({
          data: {
            userId: ctx.user.id,
            roomId: input.roomId,
          },
        });

        // Emit event for real-time updates
        ee.emit("USER_JOINED", {
          roomId: input.roomId,
          userId: ctx.user.id,
        });

        return userRoom;
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            // Unique constraint violation
            throw new TRPCError({
              code: "CONFLICT",
              message: "You are already a member of this room",
            });
          }
        }
        throw error;
      }
    }),

  leave: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the user is actually in the room
        const membership = await ctx.prisma.userRoom.findUnique({
          where: {
            userId_roomId: {
              userId: ctx.user.id,
              roomId: input.roomId,
            },
          },
        });

        if (!membership) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "You are not a member of this room",
          });
        }

        // Remove the membership
        const userRoom = await ctx.prisma.userRoom.delete({
          where: {
            userId_roomId: {
              userId: ctx.user.id,
              roomId: input.roomId,
            },
          },
        });

        // Emit event for real-time updates
        ee.emit("USER_LEFT", {
          roomId: input.roomId,
          userId: ctx.user.id,
        });

        return userRoom;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to leave room",
        });
      }
    }),

  onUserJoined: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      return {
        emit: (emit: { data: (data: { userId: string }) => void }) => {
          const onJoin = (data: { roomId: string; userId: string }) => {
            if (data.roomId === input.roomId) {
              emit.data({ userId: data.userId });
            }
          };
          ee.on("USER_JOINED", onJoin);
          return () => {
            ee.off("USER_JOINED", onJoin);
          };
        },
      };
    }),

  onUserLeft: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      return {
        emit: (emit: { data: (data: { userId: string }) => void }) => {
          const onLeave = (data: { roomId: string; userId: string }) => {
            if (data.roomId === input.roomId) {
              emit.data({ userId: data.userId });
            }
          };
          ee.on("USER_LEFT", onLeave);
          return () => {
            ee.off("USER_LEFT", onLeave);
          };
        },
      };
    }),
});
