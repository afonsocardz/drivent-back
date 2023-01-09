import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivities, subscriptionActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("", getActivities)
  .post("", subscriptionActivity);

export { activitiesRouter };
