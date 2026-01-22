import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // Create Ranks
    const rootRank = await prisma.rank.upsert({
        where: { name: 'Root' },
        update: {},
        create: {
            name: 'Root',
            order: 100,
            systemRole: 'ROOT'
        }
    })

    await prisma.rank.upsert({
        where: { name: 'Chief' },
        update: {},
        create: {
            name: 'Chief',
            order: 90,
            systemRole: 'ADMIN'
        }
    })

    await prisma.rank.upsert({
        where: { name: 'Lieutenant' },
        update: {},
        create: {
            name: 'Lieutenant',
            order: 70,
            systemRole: 'MODERATOR'
        }
    })

    await prisma.rank.upsert({
        where: { name: 'Officer' },
        update: {},
        create: {
            name: 'Officer',
            order: 50,
            systemRole: 'MEMBER'
        }
    })

    await prisma.rank.upsert({
        where: { name: 'Recruit' },
        update: {},
        create: {
            name: 'Recruit',
            order: 10,
            systemRole: 'GUEST'
        }
    })

    // Create Root User
    const user = await prisma.user.upsert({
        where: { email: 'root@narcotic.div' },
        update: {},
        create: {
            email: 'root@narcotic.div',
            rpName: 'System Administrator',
            badgeNumber: '000',
            password,
            rankId: rootRank.id,
            phoneNumber: '555-0000',
            avatarUrl: '/images/default-avatar.png'
        }
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
