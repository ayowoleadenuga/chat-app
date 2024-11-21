// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clean up existing data
    await prisma.reaction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.userRoom.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Cleaned up existing data");

    // Create users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: "alice",
        },
      }),
      prisma.user.create({
        data: {
          username: "bob",
        },
      }),
    ]);

    console.log("👥 Created users:", users.map((u) => u.username).join(", "));

    // Create chat rooms
    const rooms = await Promise.all([
      prisma.chatRoom.create({
        data: {
          name: "General Chat",
          users: {
            create: users.map((user) => ({
              userId: user.id,
            })),
          },
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Tech Discussion",
          users: {
            create: [{ userId: users[0].id }],
          },
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Random",
          users: {
            create: [{ userId: users[1].id }],
          },
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Gaming",
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Movies & TV",
        },
      }),
    ]);

    console.log("🏠 Created chat rooms:", rooms.map((r) => r.name).join(", "));

    // Create some initial messages
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          content: "Welcome to the General Chat room!",
          userId: users[0].id,
          roomId: rooms[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: "Hey everyone! 👋",
          userId: users[1].id,
          roomId: rooms[0].id,
        },
      }),
      prisma.message.create({
        data: {
          content: "Who wants to discuss the latest tech news?",
          userId: users[0].id,
          roomId: rooms[1].id,
        },
      }),
    ]);

    console.log("💬 Created initial messages");

    // Add some reactions
    await Promise.all([
      prisma.reaction.create({
        data: {
          type: "like",
          userId: users[1].id,
          messageId: messages[0].id,
        },
      }),
      prisma.reaction.create({
        data: {
          type: "like",
          userId: users[0].id,
          messageId: messages[1].id,
        },
      }),
    ]);

    console.log("👍 Added initial reactions");

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
