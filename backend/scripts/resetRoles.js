import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'crystal6572@gmail.com'
  console.log('Resetting roles: making everyone USER except', adminEmail)
  const users = await prisma.user.findMany({ select: { id: true, email: true, username: true, role: true } })
  for (const u of users) {
    const newRole = (u.email === adminEmail) ? 'ADMIN' : 'USER'
    if (u.role !== newRole) {
      await prisma.user.update({ where: { id: u.id }, data: { role: newRole } })
      console.log(`Updated ${u.email} -> ${newRole}`)
    }
  }
  console.log('Done')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
