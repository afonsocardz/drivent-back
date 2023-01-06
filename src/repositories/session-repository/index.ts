import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

async function create(data: Prisma.SessionUncheckedCreateInput) {
  return prisma.session.create({
    data,
  });
}

async function insertSession(data: Prisma.SessionUncheckedCreateInput) {
  return;
}

const sessionRepository = {
  create,
};

export default sessionRepository;
