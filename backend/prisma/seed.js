import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'password123', 10)
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
      password,
      bio: 'Hello, I am Alice',
      xp: 10,
      level: 1
    }
  })

  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'test1234', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'crystal6572@gmail.com' },
    update: {},
    create: {
      username: 'CrystalDust || OWNER',
      email: 'crystal6572@gmail.com',
      password: adminPassword,
      bio: 'Admin account',
      xp: 1000,
      level: 10,
      role: 'ADMIN'
    }
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@example.com',
      password,
      bio: 'Bob here',
      xp: 20,
      level: 1
    }
  })

  await prisma.post.upsert({
    where: { id: 'post1' },
    update: {},
    create: {
      id: 'post1',
      userId: alice.id,
      content: 'Welcome to Pulse! This is a seeded post.',
      image: null
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
