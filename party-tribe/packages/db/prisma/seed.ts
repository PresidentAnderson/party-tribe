import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "alice@partytribe.com" },
    update: {},
    create: {
      email: "alice@partytribe.com",
      username: "alice_organizer",
      name: "Alice Johnson",
      bio: "Professional event organizer and party enthusiast",
      isOrganizer: true,
      verified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@partytribe.com" },
    update: {},
    create: {
      email: "bob@partytribe.com",
      username: "bob_party",
      name: "Bob Smith",
      bio: "Love attending amazing parties and meeting new people",
      isOrganizer: false,
    },
  });

  // Create sample tribe
  const tribe = await prisma.tribe.create({
    data: {
      name: "Silicon Valley Party Tribe",
      slug: "sv-party-tribe",
      description: "The ultimate tech party community in Silicon Valley",
      isPrivate: false,
    },
  });

  // Add users to tribe
  await prisma.tribeMembership.createMany({
    data: [
      {
        userId: user1.id,
        tribeId: tribe.id,
        role: "ADMIN",
      },
      {
        userId: user2.id,
        tribeId: tribe.id,
        role: "MEMBER",
      },
    ],
  });

  // Create sample event
  const event = await prisma.event.create({
    data: {
      title: "Tech Meetup & Networking Party",
      slug: "tech-meetup-networking-2024",
      description: "Join us for an evening of networking, great food, and awesome people!",
      location: "San Francisco, CA",
      venue: "TechHub SF",
      startDate: new Date("2024-12-01T19:00:00Z"),
      endDate: new Date("2024-12-01T23:00:00Z"),
      capacity: 100,
      price: 25.0,
      isPublic: true,
      status: "PUBLISHED",
      organizerId: user1.id,
      tribeId: tribe.id,
    },
  });

  // Add attendance
  await prisma.eventAttendance.create({
    data: {
      userId: user2.id,
      eventId: event.id,
      status: "GOING",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log({
    users: [user1, user2],
    tribe,
    event,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });