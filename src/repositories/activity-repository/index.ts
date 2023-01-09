import { prisma } from "@/config";
import { Prisma, Subscription } from "@prisma/client";
import { number } from "joi";

async function getActivitiesByDate(dateId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      activityDateId: dateId,
    },
  });
  return activities;
}
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
async function updateCapacity(activityId: number) {
  return prisma.activity.update({
    where: { id: activityId },
    data: {
      capacity: { increment: -1 }
    }
  });
}
async function transactionSubscription(userId: number, activityId: number) 
{
  return prisma.$transaction(async () => {
    const subs = await createActivitySubscription(userId, activityId);
    await updateCapacity(activityId);
    return subs;
  });
}
const activityRepository = {
  getActivitiesByDate,
  findActivitiesById,
  findActivitiesSubscription,
  transactionSubscription,
  findManyActivities,
};

export default activityRepository;
