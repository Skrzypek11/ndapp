"use client"

import { v4 as uuidv4 } from "uuid"

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISIONS_REQUIRED'

export type MarkerColor = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'black' | 'white'

export interface Marker {
    id: string; // M1, M2, etc.
    x: number;  // Pixel X in CRS.Simple
    y: number;  // Pixel Y in CRS.Simple
    color: MarkerColor;
    title?: string;
    desc?: string;
}

export type ShapeType = 'polyline' | 'polygon' | 'rect' | 'circle'

export interface Shape {
    id: string; // S1, S2, etc.
    type: ShapeType;
    coords: { x: number; y: number }[];
    radius?: number; // For circles
    color: string;
    title?: string;
    desc?: string;
}

export interface Attachment {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    linkedMarkerIds?: string[];
}

export interface PhotoEvidence {
    id: string; // E1, E2...
    title: string;
    description?: string;
    timestamp: string; // datetime-local string
    capturedBy: {
        type: 'INTERNAL' | 'EXTERNAL';
        officerId?: string; // Mode A
        externalDetails?: { // Mode B
            fullName: string;
            affiliation?: string;
            badgeId?: string;
            contact?: string;
        };
    };
    linkedMarkerIds: string[];
    fileUrl: string;
    fileName: string;
}

export type VideoSourceType = 'BODYCAM' | 'DASHCAM' | 'SURVEILLANCE' | 'CIVILIAN' | 'UNDERCOVER' | 'DRONE' | 'OTHER'

export interface VideoEvidence {
    id: string; // V1, V2...
    title: string;
    description?: string;
    sourceType: VideoSourceType;
    otherSourceText?: string;
    timestamp: string;
    duration?: string; // HH:MM:SS
    capturedBy: {
        type: 'INTERNAL' | 'EXTERNAL';
        officerId?: string;
        externalDetails?: {
            fullName: string;
            affiliation?: string;
            contact?: string;
        };
    };
    linkedMarkerIds: string[];
    url: string;
}

export interface Report {
    id: string
    reportNumber: string | "Pending Number"
    title: string
    authorId: string
    authorName: string
    coAuthorIds: string[]
    status: ReportStatus
    content: string // HTML
    map: {
        markers: Marker[];
        shapes: Shape[];
    }
    legend: Record<MarkerColor, string>
    evidence: {
        photo: PhotoEvidence[];
        video: VideoEvidence[];
    }
    attachments: Attachment[] // Legacy
    videos: any[] // DEPRECATED - pointing to evidence.video now
    createdAt: string
    submittedAt?: string
    reviewedAt?: string
    approvedAt?: string
    reviewerId?: string
    rejectionReason?: string
}

const STORAGE_KEY = "nd_reports_db"

// Mock seed data
const initialReports: Report[] = []

export const ReportStore = {
    getAll: (): Report[] => {
        if (typeof window === "undefined") return []
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []
        return JSON.parse(data)
    },

    getById: (id: string): Report | undefined => {
        const reports = ReportStore.getAll()
        const report = reports.find((r) => r.id === id)
        if (report && !report.map) {
            report.map = { markers: (report as any).markers || [], shapes: [] }
        }
        return report
    },

    create: (report: Omit<Report, "id" | "createdAt" | "reportNumber">): Report => {
        const reports = ReportStore.getAll()
        const newReport: Report = {
            ...report,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            reportNumber: "Pending Number", // Assigned at submission
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...reports, newReport]))
        return newReport
    },

    update: (id: string, updates: Partial<Report>): Report | null => {
        const reports = ReportStore.getAll()
        const index = reports.findIndex((r) => r.id === id)
        if (index === -1) return null

        const updated = { ...reports[index], ...updates }
        reports[index] = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
        return updated
    },

    submit: (id: string): Report | null => {
        const reports = ReportStore.getAll()
        const index = reports.findIndex((r) => r.id === id)
        if (index === -1) return null

        const report = reports[index]

        // Assign ID if it doesn't have one (only on first submit)
        let reportNumber = report.reportNumber
        if (reportNumber === "Pending Number") {
            const now = new Date()
            const year = now.getFullYear().toString().slice(-2)
            const month = (now.getMonth() + 1).toString().padStart(2, "0")

            // Simple incremental ID for now based on total reports count for uniqueness in mock
            const count = reports.filter(r => r.reportNumber !== "Pending Number").length + 1
            const sequence = count.toString().padStart(3, "0")
            reportNumber = `ND-${year}-${month}-${sequence}`
        }

        const updated: Report = {
            ...report,
            status: "SUBMITTED", // Moves to submitted, waiting for review pick-up
            submittedAt: new Date().toISOString(),
            reportNumber
        }

        reports[index] = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
        return updated
    },

    reviewAction: (id: string, action: 'approve' | 'reject', reviewerId: string, reason?: string): Report | null => {
        const reports = ReportStore.getAll()
        const index = reports.findIndex((r) => r.id === id)
        if (index === -1) return null

        const now = new Date().toISOString()
        const current = reports[index]

        let updates: Partial<Report> = {
            reviewerId,
            reviewedAt: now
        }

        if (action === 'approve') {
            updates.status = 'APPROVED'
            updates.approvedAt = now
            updates.rejectionReason = undefined // Clear any previous reason
        } else {
            // After Request Revisions the report returns to Draft and keeps its number.
            updates.status = 'DRAFT'
            updates.rejectionReason = reason
        }

        const updated = { ...current, ...updates }
        reports[index] = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
        return updated
    }
}
