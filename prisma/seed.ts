import { User, Enrollment, TicketType, Ticket, TicketStatus, Hotel, Place, ActivityDate } from "@prisma/client";
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
        price: 250,
        isRemote: false,
        includesHotel: false,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 600,
        isRemote: false,
        includesHotel: true,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Online",
        price: 100,
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
        value: 100,
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
async function createDates()
{
  let activitiesDates = await prisma.activityDate.findMany();
  if (activitiesDates.length===0) 
  {
    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    })

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date()
      }
    }) 
    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    }) 
    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T10:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2022-12-24T09:00:00-00:00")
      }
    }) 

    await prisma.activityDate.create({
      data:{
        date:new Date("2023-12-26T09:00:00-00:00")
      }
    }) 


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

async function createActivities(locales:  Place[]) {
  let activities = await prisma.activity.findMany();
  if (activities.length === 0 && locales.length >= 3) {
    await prisma.activity.create({
      data: {
        name: "Minecraft: Montando o PC ideal",
        capacity: 27,
        placeId: locales[0].id,
        activityDateId: 1,
        startTime: new Date("2022-12-24T09:00:00-00:00"),
        endTime: new Date("2022-12-24T10:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "LoL: Montando o PC ideal",
        capacity: 10,
        placeId: locales[0].id,
        activityDateId: 2,
        startTime: new Date("2022-12-24T10:00:00-00:00"),
        endTime: new Date("2022-12-24T11:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Palestra x",
        capacity: 27,
        placeId: locales[1].id,
        activityDateId:3,
        startTime: new Date("2022-12-24T09:00:00-00:00"),
        endTime: new Date("2022-12-24T11:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Palestra y",
        capacity: 27,
        placeId: locales[2].id,
        activityDateId: 4,
        startTime: new Date("2015-12-24T09:00:00-00:00"),
        endTime: new Date("2022-12-24T10:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Palestra z",
        capacity: 1,
        placeId: locales[2].id,
        activityDateId: 5,
        startTime: new Date("2022-12-24T10:00:00-00:00"),
        endTime: new Date("2022-12-24T11:00:00-00:00"),
      },
    });

    await prisma.activity.create({
      data: {
        name: "Ceia de Natal",
        capacity: 20,
        placeId: locales[0].id,
        activityDateId:6,
        startTime: new Date("2022-12-25T09:00:00-00:00"),
        endTime: new Date("2022-12-25T11:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Workshop: Arroz com uva passa",
        capacity: 20,
        placeId: locales[2].id,
        activityDateId: 7,
        startTime: new Date("2022-12-25T09:00:00-00:00"),
        endTime: new Date("2022-12-25T10:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Atividade qualquer 1",
        capacity: 20,
        placeId: locales[0].id,
        activityDateId: 8,
        startTime: new Date("2023-12-26T09:00:00-00:00"),
        endTime: new Date("2023-12-26T12:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Atividade qualquer 2",
        capacity: 5,
        placeId: locales[1].id,
        activityDateId: 9,
        startTime: new Date("2023-12-26T09:00:00-00:00"),
        endTime: new Date("2023-12-26T10:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Atividade qualquer 3",
        capacity: 60,
        placeId: locales[2].id,
        activityDateId: 10,
        startTime: new Date("2023-12-26T09:00:00-00:00"),
        endTime: new Date("2023-12-26T11:00:00-00:00"),
      },
    });
    await prisma.activity.create({
      data: {
        name: "Atividade qualquer 4",
        capacity: 60,
        placeId: locales[2].id,
        activityDateId: 11,
        startTime: new Date(),
        endTime: new Date(),
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
  await createDates();
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