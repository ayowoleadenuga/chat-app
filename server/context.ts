import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function createContext({ req }: CreateNextContextOptions) {
  try {
    const headersList = headers();
    // Get the authorization header
    const authHeader = (await headersList).get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { prisma, user: null };
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return { prisma, user: null };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: token },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid auth token",
      });
    }
    return {
      prisma,
      user,
    };
  } catch (error) {
    console.error("Context creation error:", error);
    return {
      prisma,
      user: null,
    };
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;
