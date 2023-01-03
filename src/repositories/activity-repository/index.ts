import { prisma } from "@/config";

async function getDates() {
  return await prisma.date.findMany({});
}

async function getPlaces() {
  return await prisma.place.findMany({});
}

async function getActivitiesByDate(dateId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      dateId
    }
  });
  return activities;
}
