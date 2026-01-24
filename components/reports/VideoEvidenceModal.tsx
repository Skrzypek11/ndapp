"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { VideoEvidence, VideoSourceType, Marker } from "@/lib/store/reports"
import { getUsers } from "@/app/actions/user"
import { Video, User, Clock, Link as LinkIcon, Globe, Info, PlayCircle } from "lucide-react"

interface VideoEvidenceModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (evidence: VideoEvidence) => void
    initialData?: VideoEvidence | null
    availableMarkers: Marker[]
}

interface Agent {
    id: string
    name: string
    badge: string
}

const SOURCE_TYPES: { label: string; value: VideoSourceType }[] = [
    { label: 'Bodycam', value: 'BODYCAM' },
    { label: 'Dashcam', value: 'DASHCAM' },
    { label: 'Surveillance', value: 'SURVEILLANCE' },
    { label: 'Civilian Recording', value: 'CIVILIAN' },
    { label: 'Undercover', value: 'UNDERCOVER' },
    { label: 'Drone', value: 'DRONE' },
    { label: 'Other', value: 'OTHER' }
]

export default function VideoEvidenceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    availableMarkers
}: VideoEvidenceModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [sourceType, setSourceType] = useState<VideoSourceType>('BODYCAM')
    const [otherSourceText, setOtherSourceText] = useState("")
    const [timestamp, setTimestamp] = useState("")
    const [duration, setDuration] = useState("")
    const [captureMode, setCaptureMode] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL')
    const [officerId, setOfficerId] = useState("")
    const [externalName, setExternalName] = useState("")
    const [externalAffiliation, setExternalAffiliation] = useState("")
    const [externalContact, setExternalContact] = useState("")
    const [linkedMarkerIds, setLinkedMarkerIds] = useState<string[]>([])
    const [url, setUrl] = useState("")
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
            setSourceType(initialData.sourceType)
            setOtherSourceText(initialData.otherSourceText || "")
            setTimestamp(initialData.timestamp)
            setDuration(initialData.duration || "")
            setCaptureMode(initialData.capturedBy.type)
            setOfficerId(initialData.capturedBy.officerId || "")
            if (initialData.capturedBy.externalDetails) {
                setExternalName(initialData.capturedBy.externalDetails.fullName)
                setExternalAffiliation(initialData.capturedBy.externalDetails.affiliation || "")
                setExternalContact(initialData.capturedBy.externalDetails.contact || "")
            }
            setLinkedMarkerIds(initialData.linkedMarkerIds || [])
            setUrl(initialData.url)
        } else {
            resetForm()
        }
    }, [initialData, isOpen])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setSourceType('BODYCAM')
        setOtherSourceText("")
        setTimestamp("")
        setDuration("")
        setCaptureMode('INTERNAL')
        setOfficerId("")
        setExternalName("")
        setExternalAffiliation("")
        setExternalContact("")
        setLinkedMarkerIds([])
        setUrl("")
    }

    const handleSave = () => {
        if (!title || !timestamp || !url || !sourceType) {
            alert("Title, Timestamp, Source Type, and URL are required.")
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

        const evidence: VideoEvidence = {
            id: initialData?.id || `V${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            sourceType,
            otherSourceText: sourceType === 'OTHER' ? otherSourceText : undefined,
            timestamp,
            duration,
            capturedBy: {
                type: captureMode,
                officerId: captureMode === 'INTERNAL' ? officerId : undefined,
                externalDetails: captureMode === 'EXTERNAL' ? {
                    fullName: externalName,
                    affiliation: externalAffiliation,
                    contact: externalContact
                } : undefined
            },
            linkedMarkerIds,
            url
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
            title={initialData ? "Edit Video Evidence" : "New Video Asset Entry"}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">

                {/* LEFT COLUMN: Metadata */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">Asset Intelligence</label>

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">Video Title *</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., BODYCAM - SUSPECT APPREHENSION"
                                className="uppercase font-mono text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">Source Type *</label>
                                <select
                                    value={sourceType}
                                    onChange={e => setSourceType(e.target.value as VideoSourceType)}
                                    className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                >
                                    {SOURCE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80 flex items-center gap-2">
                                    <Clock size={10} /> Duration
                                </label>
                                <Input
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    placeholder="HH:MM:SS"
                                    className="font-mono text-xs h-[34px]"
                                />
                            </div>
                        </div>

                        {sourceType === 'OTHER' && (
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">Specify Source *</label>
                                <Input
                                    value={otherSourceText}
                                    onChange={e => setOtherSourceText(e.target.value)}
                                    placeholder="Enter source type..."
                                    className="uppercase font-mono text-xs"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80 flex items-center gap-2">
                                <Clock size={10} /> Event Timestamp *
                            </label>
                            <input
                                type="datetime-local"
                                value={timestamp}
                                onChange={e => setTimestamp(e.target.value)}
                                className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80">Narrative Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Details about this recording..."
                                className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px] resize-none"
                            />
                        </div>
                    </section> section

                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">Forensic Retrieval</label>

                        <div className="flex bg-slate-900 p-1 rounded-md border border-border">
                            <button
                                onClick={() => setCaptureMode('INTERNAL')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${captureMode === 'INTERNAL' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                            >
                                Internal Officer
                            </button>
                            <button
                                onClick={() => setCaptureMode('EXTERNAL')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${captureMode === 'EXTERNAL' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/40 hover:text-white'}`}
                            >
                                External Source
                            </button>
                        </div>

                        {captureMode === 'INTERNAL' ? (
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1.5 block px-1 opacity-80 flex items-center gap-2">
                                    <User size={10} /> Forensic Tech / Officer *
                                </label>
                                <select
                                    value={officerId}
                                    onChange={e => setOfficerId(e.target.value)}
                                    className="w-full bg-slate-900 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                                >
                                    <option value="">Select Personnel...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.badge} - {agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">Full Name *</label>
                                    <Input value={externalName} onChange={e => setExternalName(e.target.value.toUpperCase())} className="text-[10px] h-7 font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">Affiliation</label>
                                    <Input value={externalAffiliation} onChange={e => setExternalAffiliation(e.target.value.toUpperCase())} className="text-[10px] h-7 font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase mb-1 block px-1 opacity-60">Contact (Phone/Email)</label>
                                    <Input value={externalContact} onChange={e => setExternalContact(e.target.value)} className="text-[10px] h-7" />
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: URL & Markers */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest block border-b border-primary/10 pb-1">Digital Location</label>

                        <div className="p-4 bg-slate-950 rounded-lg border-2 border-dashed border-border group transition-colors hover:border-primary/40">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Globe size={16} className="text-primary" />
                                </div>
                                <label className="text-[10px] font-bold uppercase text-white/60">Forensic Host URL *</label>
                            </div>
                            <Input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://secure.nd.gov/vault/..."
                                className="font-mono text-[10px]"
                            />
                            <div className="mt-2 flex items-start gap-2 text-[9px] text-white/20 italic">
                                <Info size={10} className="mt-0.5 shrink-0" />
                                <span>Ensure the URL points to a verified forensic storage location.</span>
                            </div>
                        </div>

                        {url && (
                            <div className="flex items-center justify-center py-6 border border-border/50 rounded-lg bg-black/40">
                                <div className="flex flex-col items-center gap-2">
                                    <PlayCircle size={40} className="text-primary/40" />
                                    <span className="text-[10px] text-primary/40 font-mono tracking-widest">VALIDATED LINK DETECTED</span>
                                </div>
                            </div>
                        )}
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
                                    No tactical markers deployed on map
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="pt-4 flex justify-end gap-3 mt-auto">
                        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" size="md" onClick={handleSave} icon={Video}>Register Video</Button>
                    </div>
                </div>

            </div>
        </Modal>
    )
}
