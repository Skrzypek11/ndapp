import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUsers, getRanks } from "@/app/actions/user"
import UserManagement from "./UserManagement"

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions)

    // Basic role check
    if (session?.user?.rank?.systemRole !== 'ADMIN' && session?.user?.rank?.systemRole !== 'ROOT') {
        redirect("/dashboard")
    }

    const users = await getUsers()
    const ranks = await getRanks()

    return <UserManagement users={users} ranks={ranks} />
}
