import { User, Enrollment, TicketType, Ticket, TicketStatus, Hotel, Place } from "@prisma/client";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import faker from "@faker-js/faker";
import { generateCPF, getStates } from "@brazilian-utils/brazilian-utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createEvent() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }
  console.log({ event });
}
async function createUser(): Promise<User> {
  let testUser = await prisma.user.findFirst({
    where: {
      email: "teste@gmail.com",
    },
  });
  if (!testUser) {
    const hashedPassword = await bcrypt.hash("123456", 12);
    testUser = await prisma.user.create({
      data: {
        email: "teste@gmail.com",
        password: hashedPassword,
      },
    });
  }
  console.log({ testUser });
  return testUser;
}

async function createEnrollmentWithAddress(user: User): Promise<Enrollment> {
  let enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
    },
  });
  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        name: "Teste",
        cpf: generateCPF(),
        birthday: faker.date.past(),
        phone: faker.phone.phoneNumber("(##) 9####-####"),
        userId: user.id,
      },
    });
    const address = await prisma.address.create({
      data: {
        street: faker.address.streetName(),
        cep: faker.address.zipCode(),
        city: faker.address.city(),
        neighborhood: faker.address.city(),
        number: faker.datatype.number().toString(),
        state: faker.helpers.arrayElement(getStates()).name,
        enrollmentId: enrollment.id,
      },
    });
  }
  console.log({ enrollment });
  return enrollment;
}

async function createTicketTypes(): Promise<TicketType[]> {
  let ticketTypes = await prisma.ticketType.findMany();
  if (ticketTypes.length === 0) {
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 250_00,
        isRemote: false,
        includesHotel: false,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 600_00,
        isRemote: false,
        includesHotel: true,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Online",
        price: 100_00,
        isRemote: true,
        includesHotel: false,
      },
    });
    ticketTypes = await prisma.ticketType.findMany();
  }
  return ticketTypes;
}

async function createTicket(enrollment: Enrollment, ticketType: TicketType): Promise<Ticket> {
  let ticket = await prisma.ticket.findFirst({
    where: {
      ticketTypeId: ticketType.id,
      enrollmentId: enrollment.id,
    },
  });
  if (!ticket) {
    ticket = await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.RESERVED,
      },
    });
  }
  console.log({ ticket });
  return ticket;
}

async function createPayment(ticket: Ticket) {
  let payment = await prisma.payment.findFirst({
    where: {
      ticketId: ticket.id,
    },
  });
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        ticketId: ticket.id,
        value: 100_00,
        cardIssuer: faker.name.findName(),
        cardLastDigits: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
      },
    });
    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.PAID,
      },
    });
  }
  console.log({ payment });
}

async function createHotels(): Promise<Hotel[]> {
  let hotels = await prisma.hotel.findMany();
  if (hotels.length === 0) {
    await prisma.hotel.create({
      data: {
        name: "Driven Resort",
        image: "https://strapi-taua.s3.sa-east-1.amazonaws.com/medium_principal_a92281080b_80b34f8d4b.jpeg",
      },
    });
    await prisma.hotel.create({
      data: {
        name: "Driven Palace",
        image: "https://worldtraveller73.files.wordpress.com/2020/07/dsc_0364.jpg-1.jpeg?w=1280&h=848&crop=1",
      },
    });
    await prisma.hotel.create({
      data: {
        name: "Driven World",
        image: "https://cdn.thomascook.com/optimized3/13281/4/image_1c7c4303bed6404fb1dfe0a686e8613a.webp",
      },
    });
    hotels = await prisma.hotel.findMany();
  }
  console.log({ hotels });
  return hotels;
}

async function createRooms(hotel: Hotel) {
  const rooms = await prisma.room.findMany({
    where: {
      hotelId: hotel.id,
    },
  });
  if (rooms.length === 0) {
    for (let i = 1; i <= 16; i++) {
      await prisma.room.create({
        data: {
          name: String(i),
          capacity: 1 + Math.floor(Math.random() * 3),
          hotelId: hotel.id,
        },
      });
    }
  }
}
async function createLocales() {
  let locales = await prisma.place.findMany();
  if (locales.length === 0) {
    await prisma.place.create({
      data: {
        name: "Auditório Principal",
      },
    });
    await prisma.place.create({
      data: {
        name: "Auditório Lateral",
      },
    });
    await prisma.place.create({
      data: {
        name: "Sala de Workshop",
      },
    });
    locales = await prisma.place.findMany();
  }
  console.log({ locales });
  return locales;
}

async function createActivities(locales: Place[]) {
  let activities = await prisma.activity.findMany();
  if (activities.length === 0 && locales.length >= 3) {
    await prisma.activity.create({
      data: {
        name: "Minecraft: Montando o PC ideal",
        capacity: 27,
        placeId: locales[0].id,
        activityDate: new Date("2023-01-18T09:00:00-00:00"),
        startTime: new Date("2023-01-18T09:00:00-00:00"),
        endTime: new Date("2023-01-18T10:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "LoL: Montando o PC ideal",
        capacity: 10,
        placeId: locales[0].id,
        activityDate: new Date("2023-01-18T10:00:00-00:00"),
        startTime: new Date("2023-01-18T10:00:00-00:00"),
        endTime: new Date("2023-01-18T11:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Implemente bons commits",
        capacity: 27,
        placeId: locales[1].id,
        activityDate: new Date("2023-01-18T11:00:00-00:00"),
        startTime: new Date("2023-01-18T11:00:00-00:00"),
        endTime: new Date("2023-01-18T12:45:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Montando a Ceia de Natal",
        capacity: 27,
        placeId: locales[2].id,
        activityDate: new Date("2023-01-18T09:00:00-00:00"),
        startTime: new Date("2023-01-18T09:00:00-00:00"),
        endTime: new Date("2023-01-18T11:30:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Gerenciamento Online",
        capacity: 1,
        placeId: locales[2].id,
        activityDate: new Date("2023-01-18T10:00:00-00:00"),
        startTime: new Date("2023-01-18T10:00:00-00:00"),
        endTime: new Date("2023-01-18T11:30:00-00:00"),
      },
    });

    await prisma.activity.create({
      data: {
        name: "Guia de uma mente de Sucesso",
        capacity: 20,
        placeId: locales[0].id,
        activityDate: new Date("2023-01-18T11:00:00-00:00"),
        startTime: new Date("2023-01-18T11:00:00-00:00"),
        endTime: new Date("2023-01-18T13:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Gestão Financeira",
        capacity: 20,
        placeId: locales[2].id,
        activityDate: new Date("2023-01-19T10:30:00-00:00"),
        startTime: new Date("2023-01-19T10:30:00-00:00"),
        endTime: new Date("2023-01-19T12:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Atualizando a biblioteca mental",
        capacity: 20,
        placeId: locales[0].id,
        activityDate: new Date("2023-01-19T10:30:00-00:00"),
        startTime: new Date("2023-01-19T10:30:00-00:00"),
        endTime: new Date("2023-01-19T11:30:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Apresentação: guia de vestimenta",
        capacity: 5,
        placeId: locales[1].id,
        activityDate: new Date("2023-01-20T09:00:00-00:00"),
        startTime: new Date("2023-01-20T09:00:00-00:00"),
        endTime: new Date("2023-01-20T10:45:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Receitas para surpreender",
        capacity: 60,
        placeId: locales[2].id,
        activityDate: new Date("2023-01-20T10:45:00-00:00"),
        startTime: new Date("2023-01-20T10:45:00-00:00"),
        endTime: new Date("2023-01-20T12:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Implemente bons commits",
        capacity: 0,
        placeId: locales[2].id,
        activityDate: new Date("2023-01-20T14:45:00-00:00"),
        startTime: new Date("2023-01-20T14:45:00-00:00"),
        endTime: new Date("2023-01-20T16:45:00-00:00"),
      },
    });
  }
}

async function main() {
  await createEvent();
  const user = await createUser();
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketTypes = await createTicketTypes();
  const ticket = await createTicket(enrollment, ticketTypes[1]);
  await createPayment(ticket);
  const hotels = await createHotels();
  hotels.forEach(async (hotel) => {
    await createRooms(hotel);
  });
  const locales = await createLocales();
  await createActivities(locales);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
