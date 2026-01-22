"use client"

import { v4 as uuidv4 } from "uuid"

export interface Announcement {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    createdBy: string;
    createdAt: string;
    expiresAt?: string;
}

const STORAGE_KEY = "nd_announcements_db"

export const AnnouncementStore = {
    getAll: (): Announcement[] => {
        if (typeof window === "undefined") return []
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return [
            {
                id: "1",
                title: "Welcome to Narcotic Division Database v2",
                content: "The new Case Management and Dashboard modules are now active. Please report any issues to the Command Desk.",
                isPinned: true,
                createdBy: "System Admin",
                createdAt: new Date().toISOString()
            }
        ]
        return JSON.parse(data)
    },

    create: (data: Omit<Announcement, "id" | "createdAt">): Announcement => {
        const items = AnnouncementStore.getAll()
        const newItem: Announcement = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...items, newItem]))
        return newItem
    },

    delete: (id: string) => {
        const items = AnnouncementStore.getAll()
        const filtered = items.filter(a => a.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }
}
