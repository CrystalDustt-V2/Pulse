import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(){
  const user = await prisma.user.findUnique({ where: { email: 'crystal6572@gmail.com' } })
  if (!user) {
    console.log('admin not found')
    return
  }
  // if the password field looks unhashed (very short), replace it
  if (user.password && user.password.length < 20) {
    const hashed = await bcrypt.hash('test1234', 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    console.log('admin password updated to hashed value')
  } else {
    console.log('admin password appears already hashed')
  }
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
