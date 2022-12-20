import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { Booking, Hotel, Room } from "@prisma/client";

function filterHotels(hotels: HotelWithRooms[]) {
  return hotels.filter((hotel) => {
    const newHotel = prepareHotel(hotel);
    if (newHotel.hasBooking) {
      hotels.length = 0;
      return hotel;
    }
    if (newHotel.vacancyQty > 0) {
      return hotel;
    }
  });
}

type HotelRooms = (Room & {
  Booking: Booking[];
  _count: {
    Booking: number;
  };
})

function prepareHotel(hotel: HotelWithRooms) {
  const rooms: HotelRooms[] = hotel.Rooms;
  const hash: Record<string, string> = {};
  hotel.vacancyQty = 0;
  for (let i = 0; i < rooms.length; i++) {
    hotel.vacancyQty += vacancyQty(rooms[i]);
    hotel.hasBooking = userHasBooking(rooms[i]);
    setRoomTypes(hash, rooms[i]);
  }
  hotel.roomTypes = Object.values(hash).join(", ");
  return hotel;
}

function setRoomTypes(hash: Record<string, string>, room: HotelRooms) {
  const SINGLE = 1;
  const DOUBLE = 2;
  const TRIPLE = 3;
  const capacity = room.capacity > TRIPLE ? TRIPLE : room.capacity;
  if (!hash[capacity]) {
    if (capacity === SINGLE) {
      hash[capacity] = "Single";
    }
    if (capacity === DOUBLE) {
      hash[capacity] = "Double";
    }
    if (capacity >= TRIPLE) {
      hash[capacity] = "Triple";
    }
  }
}

function userHasBooking(room: HotelRooms) {
  if (room.Booking) {
    return {
      roomName: room.name,
      bookingId: room.Booking[0].id,
    };
  }
  return false;
}

function vacancyQty(room: HotelRooms) {
  return room.capacity - room._count.Booking;
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

type UserBooking = {
  roomName: string,
  bookingId: number
}

type HotelWithRooms = (Hotel & {
  vacancyQty?: number,
  hasBooking?: boolean | UserBooking,
  roomTypes?: string,
  Rooms: (Room & {
    Booking: Booking[];
    _count: {
      Booking: number;
    };
  })[];
});

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels(userId);

  return filterHotels(hotels);
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
