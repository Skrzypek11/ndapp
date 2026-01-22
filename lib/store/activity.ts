"use client"

import { v4 as uuidv4 } from "uuid"

export type ActivityType =
    | 'REPORT_SUBMITTED'
    | 'REPORT_APPROVED'
    | 'CASE_INITIALIZED'
    | 'CASE_SUBMITTED'
    | 'CASE_ASSIGNED'
    | 'CASE_COMPLETED'
    | 'CASE_CLOSED'
    | 'CASE_RETURNED'

export interface Activity {
    id: string;
    type: ActivityType;
    userId: string;
    userName: string;
    targetId?: string;
    targetTitle?: string;
    timestamp: string;
}

const STORAGE_KEY = "nd_activity_db"

export const ActivityStore = {
    getAll: (): Activity[] => {
        if (typeof window === "undefined") return []
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []
        return JSON.parse(data)
    },

    log: (activity: Omit<Activity, "id" | "timestamp">) => {
        const items = ActivityStore.getAll()
        const newItem: Activity = {
            ...activity,
            id: uuidv4(),
            timestamp: new Date().toISOString()
        }
        // Keep only last 50 activities
        const updated = [newItem, ...items].slice(0, 50)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return newItem
    }
}
