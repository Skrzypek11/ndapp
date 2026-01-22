"use client"

import { v4 as uuidv4 } from "uuid"

export type CaseStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RETURNED' | 'PENDING_CLOSURE' | 'CLOSED'

export interface LinkedReport {
    reportId: string;
    contextNote?: string;
}

export interface Case {
    id: string;
    caseId: string; // e.g. CASE-2024-001
    title: string;
    description?: string;
    status: CaseStatus;
    reportingOfficerId: string;
    reportingOfficerName: string;
    leadInvestigatorId: string;
    leadInvestigatorName: string;
    participantIds: string[];
    linkedReports: LinkedReport[];
    createdAt: string;
    submittedAt?: string;
    approvedAt?: string;
    closedAt?: string;
    rejectionReason?: string;
}

const STORAGE_KEY = "nd_cases_db"

export const CaseStore = {
    getAll: (): Case[] => {
        if (typeof window === "undefined") return []
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []
        return JSON.parse(data)
    },

    getById: (id: string): Case | undefined => {
        const cases = CaseStore.getAll()
        return cases.find((c) => c.id === id)
    },

    create: (caseData: Omit<Case, "id" | "createdAt" | "caseId" | "status">): Case => {
        const cases = CaseStore.getAll()
        const newCase: Case = {
            ...caseData,
            id: uuidv4(),
            caseId: "Pending Number",
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...cases, newCase]))
        return newCase
    },

    update: (id: string, updates: Partial<Case>): Case | null => {
        const cases = CaseStore.getAll()
        const index = cases.findIndex((c) => c.id === id)
        if (index === -1) return null

        const updated = { ...cases[index], ...updates }
        cases[index] = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
        return updated
    },

    submit: (id: string): Case | null => {
        const cases = CaseStore.getAll()
        const index = cases.findIndex((c) => c.id === id)
        if (index === -1) return null

        const currentCase = cases[index]
        let caseId = currentCase.caseId
        if (caseId === "Pending Number") {
            const now = new Date()
            const year = now.getFullYear()
            const count = cases.filter(c => c.caseId !== "Pending Number").length + 1
            caseId = `CASE-${year}-${count.toString().padStart(3, "0")}`
        }

        const updated: Case = {
            ...currentCase,
            status: "SUBMITTED",
            submittedAt: new Date().toISOString(),
            caseId
        }

        cases[index] = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
        return updated
    },

    review: (id: string): Case | null => {
        return CaseStore.update(id, { status: 'UNDER_REVIEW' })
    },

    assign: (id: string, leadId: string, leadName: string): Case | null => {
        return CaseStore.update(id, {
            status: 'ASSIGNED',
            leadInvestigatorId: leadId,
            leadInvestigatorName: leadName
        })
    },

    returnForRevisions: (id: string, reason: string): Case | null => {
        return CaseStore.update(id, {
            status: 'RETURNED',
            rejectionReason: reason
        })
    },

    complete: (id: string): Case | null => {
        return CaseStore.update(id, { status: 'PENDING_CLOSURE' })
    },

    close: (id: string): Case | null => {
        return CaseStore.update(id, {
            status: 'CLOSED',
            closedAt: new Date().toISOString()
        })
    }
}
