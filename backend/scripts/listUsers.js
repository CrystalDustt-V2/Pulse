import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, email: true, role: true } })
  console.log('users:')
  for (const u of users) console.log(`${u.email} -> ${u.username} (${u.role})`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
