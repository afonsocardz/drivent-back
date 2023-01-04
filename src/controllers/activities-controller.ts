import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getActivities(req: Request, res: Response) {
  try {
    return;
  } catch (error) {
    if (error.name === "cannotListActivitiesError") {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }
  }
}
