import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

const ee = new EventEmitter();

export const messageRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        limit: z.number().min(1).max(100).optional().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: { roomId: input.roomId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),

  send: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          userId: ctx.user.id,
          roomId: input.roomId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          reactions: true,
        },
      });

      ee.emit("NEW_MESSAGE", message);
      return message;
    }),

  addReaction: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        type: z.enum(["like", "dislike"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReaction = await ctx.prisma.reaction.findUnique({
        where: {
          userId_messageId: {
            userId: ctx.user.id,
            messageId: input.messageId,
          },
        },
      });

      let reaction;
      if (existingReaction) {
        if (existingReaction.type === input.type) {
          // Remove reaction if same type
          await ctx.prisma.reaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          // Update reaction type if different
          reaction = await ctx.prisma.reaction.update({
            where: { id: existingReaction.id },
            data: { type: input.type },
          });
        }
      } else {
        // Create new reaction
        reaction = await ctx.prisma.reaction.create({
          data: {
            type: input.type,
            userId: ctx.user.id,
            messageId: input.messageId,
          },
        });
      }

      const message = await ctx.prisma.message.findUnique({
        where: { id: input.messageId },
        include: {
          user: true,
          reactions: {
            include: {
              user: true,
            },
          },
        },
      });

      if (message) {
        ee.emit("MESSAGE_UPDATED", message);
      }

      return message;
    }),

  onNewMessage: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        const onMessage = (message: any) => {
          if (message.roomId === input.roomId) {
            emit.next(message);
          }
        };
        ee.on("NEW_MESSAGE", onMessage);
        return () => {
          ee.off("NEW_MESSAGE", onMessage);
        };
      });
    }),

  onMessageUpdated: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        const onUpdate = (message: any) => {
          if (message.roomId === input.roomId) {
            emit.next(message);
          }
        };
        ee.on("MESSAGE_UPDATED", onUpdate);
        return () => {
          ee.off("MESSAGE_UPDATED", onUpdate);
        };
      });
    }),
});
