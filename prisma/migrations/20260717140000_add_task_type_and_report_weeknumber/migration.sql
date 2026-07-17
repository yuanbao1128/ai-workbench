-- AlterTable: Add type field to Task
ALTER TABLE "Task" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'SCHEDULE';

-- AlterTable: Update Task status default from TODO to PENDING
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable: Add weekNumber field to Report
ALTER TABLE "Report" ADD COLUMN "weekNumber" INTEGER;
