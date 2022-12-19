import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelsWithRooms, getCapacityHotel } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/capacity/:hotelId", getCapacityHotel) //just test
  .get("/:hotelId", getHotelsWithRooms);

export { hotelsRouter };
