import { prisma } from "@/config";
/*
async function getActivitiesByDate(dateId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      activityDateId: dateId,
    },
  });
  return activities;
}
*/
async function findActivitiesById(id: number) {
  return prisma.activity.findUnique({
    where: {
      id: id
    }
  });
}

async function findManyActivities(userId: number) {
  return prisma.activity.findMany({
    include: {
      Place: true,
      Subscription: {
        where: {
          userId,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}
async function findActivitiesSubscription(userId: number, activitiesId: number) {
  return prisma.subscription.findFirst({
    where: {
      userId: userId,
      activityId: activitiesId
    }
  });
}
async function createActivitySubscription(userId: number, activityId: number) {
  return prisma.subscription.create({
    data: {
      userId,
      activityId
    }
  });
}

const activityRepository = {
  //getActivitiesByDate,
  findActivitiesById,
  findActivitiesSubscription,
  createActivitySubscription,
  findManyActivities,
};

export default activityRepository;
