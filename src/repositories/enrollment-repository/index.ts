import { prisma } from "@/config";
import { getAddress } from "@/utils/cep-service";
import { exclude } from "@/utils/prisma-utils";
import { Address, Enrollment } from "@prisma/client";
import { CreateAddressParams } from "../address-repository";
import addressRepository from "../address-repository";

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function findById(enrollmentId: number) {
  return prisma.enrollment.findFirst({
    where: { id: enrollmentId }
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

async function CreateOrUpdateEnrollmentWithAddressTransaction(
  params: CreateOrUpdateEnrollmentWithAddress, 
  enrollment: Omit<CreateOrUpdateEnrollmentWithAddress, "address">,
  address: CreateAddressParams
) {
  return prisma.$transaction(async () => {
    const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, "userId"));
    await addressRepository.upsert(newEnrollment.id, address, address);
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, "id" | "createdAt" | "updatedAt">;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, "userId">;
export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  findById,
  CreateOrUpdateEnrollmentWithAddressTransaction,
};

export default enrollmentRepository;
