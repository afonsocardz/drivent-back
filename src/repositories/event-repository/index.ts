import { prisma, redis } from "@/config";
import { Event } from "@prisma/client";

async function findFirst() {
  const event = await redis.get("event");
  if(!event) {
    const prismaEvent = prisma.event.findFirst();
    await redis.set("event", JSON.stringify(prismaEvent));
    return prismaEvent;
  }
  return JSON.parse(event) as Event;
}

const eventRepository = {
  findFirst,
};

export default eventRepository;
