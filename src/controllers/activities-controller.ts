import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import activityService from "@/services/activities-service";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const activities = await activityService.getActivities(Number(userId));
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    if (error.name === "cannotListActivitiesError") {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }
  }
}
export async function subscriptionActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const activityId = Number(req.body.activityId);

  try {
    const booking = await activityService.createSubscription(Number(userId), activityId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if(error.name === "BAD REQUEST") {
      return res.sendStatus(httpStatus.CONFLICT);
    }
  }}
