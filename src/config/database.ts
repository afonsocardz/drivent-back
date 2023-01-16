import { PrismaClient } from "@prisma/client";
import { createClient, RedisClientType } from "redis";

export let prisma: PrismaClient;
export let redis: RedisClientType;
export function connectDb(): void {
  prisma = new PrismaClient();
  redis = createClient();
  redis?.on("error", (err) => console.log("Redis Client Error", err));
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
  await redis?.disconnect();
}

