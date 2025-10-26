import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const newPlain = 'test1234'     // change this if you want a different password
  const hash = await bcrypt.hash(newPlain, 10)
  const user = await prisma.user.update({
    where: { email: 'crystal6572@gmail.com' },
    data: { password: hash }
  })
  console.log('updated:', { id: user.id, email: user.email })
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })