import dayjs from "dayjs";
import { notFoundError } from "@/errors";
import { ActivityError, cannotListActivitiesError } from "@/errors/cannot-list-activities-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import activityRepository from "@/repositories/activity-repository";
import compareTime from "dayjs/plugin/isSameOrAfter.js";

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
    const dateFormat = dayjs(act.ActivityDate.date.toString());
    const today = dayjs(Date.now()).format("DD/MM");
    const dateDayAndMonth = dateFormat.format("DD/MM");

    return {
      ...act,
      day: dateDayAndMonth,
      weekDay: dateFormat.locale("pt-br").format("dddd"),
      dateIsNotExpired: dayjs(dateDayAndMonth).isSameOrAfter(today),
    };
  });

  const activitiesValids = activities.filter((act) => act.dateIsNotExpired);

  //remove days duplicates
  const daysAvailable = activitiesValids.map((act) => act.day);
  const setConstructor = new Set(daysAvailable);
  const daysFiltered = [...setConstructor.values()];

  return { activitiesValids, daysFiltered };
}

const activityService = {
  getActivities,
};

export default activityService;
