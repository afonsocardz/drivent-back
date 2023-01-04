import { notFoundError } from "@/errors";
import { ActivityError, cannotListActivitiesError } from "@/errors/cannot-list-activities-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getAcitivitiesByDateId(dateId: number, userId: number) {
  await listActivities(userId);
}

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

const activityService = {
  getAcitivitiesByDateId,
};

export default activityService;
