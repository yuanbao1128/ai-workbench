const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'SCHEDULE'`)
    console.log('Task.type column added successfully')
  } catch(e) {
    console.log('Task.type:', e.message)
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING'`)
    console.log('Task.status default updated')
  } catch(e) {
    console.log('Task.status:', e.message)
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "weekNumber" INTEGER`)
    console.log('Report.weekNumber column added successfully')
  } catch(e) {
    console.log('Report.weekNumber:', e.message)
  }

  await prisma.$disconnect()
  console.log('Done')
}

main()