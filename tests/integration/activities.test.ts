import app, { init } from "@/app";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketTypeRemote, createTicketTypeWithHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("GET /activities/:activityDateId", () => {
  it("should response with 402 when user ticket is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
  it("should response with 402 when user ticket is not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
});
