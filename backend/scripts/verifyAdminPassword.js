import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function run(){
  const user = await prisma.user.findUnique({ where: { email: 'crystal6572@gmail.com' } })
  if(!user){ console.log('no user'); return }
  const ok = await bcrypt.compare('test1234', user.password)
  console.log('compare result', ok)
  await prisma.$disconnect()
}

run().catch(e=>{ console.error(e); process.exit(1) })
