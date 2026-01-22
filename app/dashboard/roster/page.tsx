"use client"

import { useState, useEffect } from "react"
import { getUsers } from "@/app/actions/user"
import RosterTable from "@/components/roster/RosterTable"
import { useTranslation } from "@/lib/i18n"

export default function RosterPage() {
    const { dict } = useTranslation()
    const [users, setUsers] = useState([])

    useEffect(() => {
        getUsers().then(data => setUsers(data as any))
    }, [])

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            <header className="page-header">
                <div className="page-title-group">
                    <h1 className="page-title">{dict.roster.title}</h1>
                    <p className="page-subtitle leading-relaxed max-w-2xl">
                        {dict.roster.subtitle}
                    </p>
                </div>
            </header>

            <RosterTable users={users} />
        </div>
    )
}
