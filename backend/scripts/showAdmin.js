import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run(){
  const user = await prisma.user.findUnique({ where: { email: 'crystal6572@gmail.com' } })
  console.log(user)
  await prisma.$disconnect()
}

run().catch(e=>{ console.error(e); process.exit(1) })
