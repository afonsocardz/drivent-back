import dayjs from "dayjs";
import { notFoundError } from "@/errors";
import { ActivityError, cannotListActivitiesError } from "@/errors/cannot-list-activities-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import activityRepository from "@/repositories/activity-repository";
import compareTime from "dayjs/plugin/isSameOrAfter.js";
import utc from "dayjs/plugin/utc";
import { datetimeConflict } from "@/errors/datetime-conflict-error";

dayjs.extend(utc);
dayjs.utc();
require("dayjs/locale/pt-br");

const isSameOrAfter = compareTime;
dayjs.extend(isSameOrAfter);

async function listActivities(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED") {
    throw cannotListActivitiesError(ActivityError.NOT_PAID);
  }
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListActivitiesError(ActivityError.TOTAL_ACCESS);
  }
}

async function getActivities(userId: number) {
  await listActivities(userId);
  const activitiesDataBase = await activityRepository.findManyActivities(userId);

  const activities = activitiesDataBase.map((act) => {
    const startTimeFormat = dayjs.utc(act.startTime);
    const endTimeFormat = dayjs.utc(act.endTime);
    const today = dayjs(Date.now());
    const activityDate = dayjs.utc(act.activityDate);
    const userIsSubscribe = act.Subscription[0]?.userId === userId;

    return {
      ...act,
      startTime: dayjs(startTimeFormat).format("HH:mm"),
      endTime: dayjs(endTimeFormat).format("HH:mm"),
      durationMinutes: dayjs(endTimeFormat).diff(startTimeFormat, "minute"),
      day: dayjs(activityDate).format("YYYY/MM/DD"),
      dateIsNotExpired: dayjs(activityDate).isSameOrAfter(today),
      userIsSubscribe,
    };
  });

  const activitiesValids = activities.filter((act) => act.dateIsNotExpired);

  //remove dias duplicates
  const daysAvailable = activitiesValids.map((act) => act.day);
  const setConstructor = new Set(daysAvailable);
  const days = [...setConstructor.values()];

  const daysFiltered = days.map((day) => {
    const weekDayComplet = dayjs(day).locale("pt-br").format("dddd");
    const weekDayFirstWord = weekDayComplet.split("-")[0];
    const weekDayFormated = weekDayFirstWord[0].toUpperCase() + weekDayFirstWord.substring(1);
    const dayAndMonth = dayjs(day).format("DD/MM");

    return { day, weekDay: weekDayFormated, dayAndMonth };
  });

  return { activitiesValids, daysFiltered };
}

async function createSubscription(userId: number, activityId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED") {
    throw notFoundError();
  }

  const activity = await activityRepository.findActivitiesById(activityId);

  if (!activity) {
    throw notFoundError();
  }

  const capacity = Number(activity.capacity);
  if (capacity < 1) {
    throw { name: "BAD REQUEST" };
  }

  const userSubscription = await activityRepository.findActivitiesSubscription(userId, activityId);

  if (userSubscription) {
    throw { name: "BAD REQUEST" };
  }
  const userActivities = await activityRepository.findManyActivities(userId);
  
  for (let index = 0; index < userActivities.length; index++) 
  {
    if(checkEventCoincidence(userActivities[index].startTime, userActivities[index].endTime,
      activity.startTime, activity.endTime))
    {
      throw datetimeConflict();
    }
  }

  const booking = await activityRepository.transactionSubscription(userId, activityId);
  return booking;
}
function checkEventCoincidence(startTime1: Date, endTime1: Date, startTime2: Date, endTime2: Date) {
  return (startTime1 <= startTime2 && endTime1 > startTime2) || (startTime1 < endTime2 && endTime1 >= endTime2);
}
const activityService = {
  getActivities,
  createSubscription,
};

export default activityService;
