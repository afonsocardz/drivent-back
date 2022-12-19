import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import roomRepository from "@/repositories/room-repository";
import bookingRepository from "@/repositories/booking-repository";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

async function getCapacity(hotelId: number) {
  if (!hotelId) {
    throw notFoundError();
  }
  const hotelRooms = await roomRepository.findAllByHotelId(hotelId);
  const capacityTotal = hotelRooms.reduce((cur, acc) => cur + acc.capacity, 0);

  const booking = await bookingRepository.findBooking(hotelId);

  const filterBooking = booking.map((room) => room.Booking).map((booking) => booking.length);

  const bookingTotal = filterBooking.reduce((cur, acc) => cur + acc, 0);

  const vacanciesHotel = capacityTotal - bookingTotal;
 
  return vacanciesHotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
  getCapacity,
};

export default hotelService;
