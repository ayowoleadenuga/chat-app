import { router } from "../trpc";
import { userRouter } from "./user";
import { roomRouter } from "./room";
import { messageRouter } from "./message";

export const appRouter = router({
  user: userRouter,
  room: roomRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
