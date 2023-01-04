/*
  Warnings:

  - You are about to drop the column `dateId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `Date` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activityDateId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_dateId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "dateId",
ADD COLUMN     "activityDateId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Date";

-- CreateTable
CREATE TABLE "ActivityDate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityDate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_activityDateId_fkey" FOREIGN KEY ("activityDateId") REFERENCES "ActivityDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
