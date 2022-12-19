import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { Hotel, Room } from "@prisma/client";

function vacantHotels(hotels: HotelWithRooms) {
  return hotels.map(hotel => {
    if (hotel.Rooms.some(room => room.capacity !== room._count.Booking))
      return hotel;
  });
}

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED") {
    throw cannotListHotelsError("Você precisa ter confirmado pagamento antes de fazer a escolha de hospedagem");
  }
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError("Sua modalidade de ingresso não inclui hospedagem Prossiga para a escolha de atividades");
  }
}

type HotelWithRooms = (Hotel & {
  Rooms: (Room & {
    _count: {
      Booking: number;
    };
  })[];
})[]

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();

  return vacantHotels(hotels);
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
