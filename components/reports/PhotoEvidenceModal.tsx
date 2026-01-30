"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PhotoEvidence, Marker } from "@/lib/store/reports"
import { getUsers } from "@/app/actions/user"
import { Camera, User, Users, Clock, Link as LinkIcon, Upload, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface PhotoEvidenceModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (evidence: PhotoEvidence) => void
    initialData?: PhotoEvidence | null
    availableMarkers: Marker[]
}

interface Agent {
    id: string
    name: string
    badge: string
}

export default function PhotoEvidenceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    availableMarkers
}: PhotoEvidenceModalProps) {
    const { dict } = useTranslation()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [timestamp, setTimestamp] = useState("") // datetime-local
    const [captureMode, setCaptureMode] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL')
    const [officerId, setOfficerId] = useState("")
    const [externalName, setExternalName] = useState("")
    const [externalAffiliation, setExternalAffiliation] = useState("")
    const [externalBadge, setExternalBadge] = useState("")
    const [externalContact, setExternalContact] = useState("")
    const [linkedMarkerIds, setLinkedMarkerIds] = useState<string[]>([])
    const [fileUrl, setFileUrl] = useState("")
    const [fileName, setFileName] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [agents, setAgents] = useState<Agent[]>([])

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const users = await getUsers()
                const formattedAgents = users.map((u: any) => ({
                    id: u.id,
                    name: u.rpName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                    badge: u.badgeNumber || "N/A"
                }))
                setAgents(formattedAgents)
            } catch (error) {
                console.error("Failed to fetch agents", error)
            }
        }
        fetchAgents()
    }, [])

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setDescription(initialData.description || "")
            setTimestamp(initialData.timestamp)
            setCaptureMode(initialData.capturedBy.type)
            setOfficerId(initialData.capturedBy.officerId || "")
            if (initialData.capturedBy.externalDetails) {
                setExternalName(initialData.capturedBy.externalDetails.fullName)
                setExternalAffiliation(initialData.capturedBy.externalDetails.affiliation || "")
                setExternalBadge(initialData.capturedBy.externalDetails.badgeId || "")
                setExternalContact(initialData.capturedBy.externalDetails.contact || "")
            }
            setLinkedMarkerIds(initialData.linkedMarkerIds || [])
            setFileUrl(initialData.fileUrl)
            setFileName(initialData.fileName)
            setPreviewUrl(initialData.fileUrl)
        } else {
            resetForm()
        }
    }, [initialData, isOpen])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setTimestamp("")
        setCaptureMode('INTERNAL')
        setOfficerId("")
        setExternalName("")
        setExternalAffiliation("")
        setExternalBadge("")
        setExternalContact("")
        setLinkedMarkerIds([])
        setFileUrl("")
        setFileName("")
        setPreviewUrl(null)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Limit file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5MB.")
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setPreviewUrl(base64)
                setFileUrl(base64)
                setFileName(file.name)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = () => {
        if (!title || !timestamp || !fileUrl) {
            alert("Title, Timestamp, and File are required.")
            return
        }

        if (captureMode === 'INTERNAL' && !officerId) {
            alert("Please select an officer.")
            return
        }

        if (captureMode === 'EXTERNAL' && !externalName) {
            alert("External source name is required.")
            return
        }

        const evidence: PhotoEvidence = {
            id: initialData?.id || `E${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            timestamp,
            capturedBy: {
                type: captureMode,
                officerId: captureMode === 'INTERNAL' ? officerId : undefined,
                externalDetails: captureMode === 'EXTERNAL' ? {
                    fullName: externalName,
                    affiliation: externalAffiliation,
                    badgeId: externalBadge,
                    contact: externalContact
                } : undefined
            },
            linkedMarkerIds,
            fileUrl,
            fileName
        }

        onSave(evidence)
        onClose()
    }

    const toggleMarker = (id: string) => {
        setLinkedMarkerIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? dict.reports.photo_modal.title_edit : dict.reports.photo_modal.title_new}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">

                {/* LEFT COLUMN: Metadata */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">{dict.reports.photo_modal.section_intelligence}</label>

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">{dict.reports.photo_modal.field_title} *</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={dict.reports.photo_modal.placeholder_title}
                                className="uppercase font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80 flex items-center gap-2">
                                <Clock size={10} /> {dict.reports.photo_modal.field_timestamp} *
                            </label>
                            <input
                                type="datetime-local"
                                value={timestamp}
                                onChange={e => setTimestamp(e.target.value)}
                                className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">{dict.reports.photo_modal.field_description}</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={dict.reports.photo_modal.placeholder_description}
                                className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px] resize-none"
                            />
                        </div>
                    </section> section

                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">{dict.reports.photo_modal.section_origin}</label>

                        <div className="flex bg-slate-900 p-1 rounded-md border border-border">
                            <button
                                onClick={() => setCaptureMode('INTERNAL')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${captureMode === 'INTERNAL' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                            >
                                {dict.reports.photo_modal.capture_mode.internal}
                            </button>
                            <button
                                onClick={() => setCaptureMode('EXTERNAL')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${captureMode === 'EXTERNAL' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                            >
                                {dict.reports.photo_modal.capture_mode.external}
                            </button>
                        </div>

                        {captureMode === 'INTERNAL' ? (
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80 flex items-center gap-2">
                                    <User size={10} /> {dict.reports.photo_modal.field_officer} *
                                </label>
                                <select
                                    value={officerId}
                                    onChange={e => setOfficerId(e.target.value)}
                                    className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                                >
                                    <option value="">{dict.reports.photo_modal.placeholder_officer}</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.badge} - {agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">{dict.reports.photo_modal.field_external_name} *</label>
                                    <Input value={externalName} onChange={e => setExternalName(e.target.value.toUpperCase())} className="text-[10px] h-7 font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">{dict.reports.photo_modal.field_external_affiliation}</label>
                                    <Input value={externalAffiliation} onChange={e => setExternalAffiliation(e.target.value.toUpperCase())} className="text-[10px] h-7 font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">{dict.reports.photo_modal.field_external_badge}</label>
                                    <Input value={externalBadge} onChange={e => setExternalBadge(e.target.value.toUpperCase())} className="text-[10px] h-7 font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">{dict.reports.photo_modal.field_external_contact}</label>
                                    <Input value={externalContact} onChange={e => setExternalContact(e.target.value)} className="text-[10px] h-7" />
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: File & Markers */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">{dict.reports.photo_modal.section_visual}</label>

                        <div className="relative aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center p-4 group overflow-hidden transition-colors hover:border-primary/40">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer bg-white/10 p-2 rounded-full border border-white/20 hover:bg-white/20">
                                            <Upload size={20} className="text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-1 text-[8px] font-mono text-white/60 truncate">
                                        {fileName}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Camera size={40} className="text-primary/20 mb-2" />
                                    <div className="text-[10px] font-bold uppercase text-white/40 mb-1">{dict.reports.photo_modal.upload_label}</div>
                                    <div className="text-[8px] text-white/20">{dict.reports.photo_modal.upload_hint}</div>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                </>
                            )}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1 flex items-center gap-2">
                            <LinkIcon size={12} /> Tactical Marker Linkage
                        </label>

                        <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 bg-slate-950 rounded border border-border">
                            {availableMarkers.length > 0 ? availableMarkers.map(m => {
                                const isSelected = linkedMarkerIds.includes(m.id)
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => toggleMarker(m.id)}
                                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border ${isSelected ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-slate-900 border-border text-white/40 hover:border-white/20'}`}
                                    >
                                        {m.id}
                                    </button>
                                )
                            }) : (
                                <div className="text-[10px] text-white/20 italic w-full text-center py-4">
                                    {dict.reports.photo_modal.no_markers}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="pt-4 flex justify-end gap-3 mt-auto">
                        <Button variant="ghost" size="sm" onClick={onClose}>{dict.reports.photo_modal.buttons.cancel}</Button>
                        <Button variant="primary" size="md" onClick={handleSave} icon={Camera}>{dict.reports.photo_modal.buttons.save}</Button>
                    </div>
                </div>

            </div>
        </Modal>
    )
}
