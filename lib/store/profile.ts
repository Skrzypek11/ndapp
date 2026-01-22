import { create } from 'zustand'

type ProfileMode = 'view' | 'edit'

interface ProfileState {
    isOpen: boolean
    userId: string | null
    mode: ProfileMode
    openProfile: (userId: string, mode?: ProfileMode) => void
    closeProfile: () => void
    setMode: (mode: ProfileMode) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
    isOpen: false,
    userId: null,
    mode: 'view',
    openProfile: (userId, mode = 'view') => set({ isOpen: true, userId, mode }),
    closeProfile: () => set({ isOpen: false, userId: null, mode: 'view' }),
    setMode: (mode) => set({ mode }),
}))
