"use server"

import { prisma } from "@/lib/prisma"

export async function searchDraftReports(query: string) {
    if (!query || query.length < 2) return []

    try {
        const reports = await prisma.report.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { reportNumber: { contains: query, mode: 'insensitive' } }
                ],
                status: {
                    in: ['DRAFT', 'REJECTED']
                }
            },
            select: {
                id: true,
                title: true,
                reportNumber: true,
                createdAt: true,
                author: { select: { rpName: true } }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        })
        return reports
    } catch (error) {
        console.error("Search Reports Error:", error)
        return []
    }
}
