import { prisma } from "@/config";

async function getActivitiesByDate(dateId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      activityDateId: dateId,
    },
  });
  return activities;
}

async function findManyActivities(userId: number) {
  return prisma.activity.findMany({
    include: {
      ActivityDate: true,
      Place: true,
      Subscription: {
        where: {
          userId,
        },
      },
    },
    orderBy: [{ ActivityDate: { date: "asc" } }, { startTime: "asc" }],
  });
}

const activityRepository = {
  getActivitiesByDate,
  findManyActivities,
};

export default activityRepository;
