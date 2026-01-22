import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            badgeNumber: string
            rank: {
                id: string
                name: string
                systemRole: string
            }
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        badgeNumber: string
        rank: {
            id: string
            name: string
            systemRole: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        badgeNumber: string
        rank: {
            id: string
            name: string
            systemRole: string
        }
    }
}
