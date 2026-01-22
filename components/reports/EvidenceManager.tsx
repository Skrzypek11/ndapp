"use client"

import { useState } from "react"
import { Image as ImageIcon, Video, Plus, X, Upload, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import PhotoEvidenceModal from "./PhotoEvidenceModal"
import VideoEvidenceModal from "./VideoEvidenceModal"
import { PhotoEvidence, VideoEvidence, Marker } from "@/lib/store/reports"
import { MOCK_AGENTS } from "./CoAuthorSelect"

interface EvidenceManagerProps {
    photos: PhotoEvidence[]
    videos: VideoEvidence[]
    markers: Marker[]
    onPhotosChange: (items: PhotoEvidence[]) => void
    onVideosChange: (items: VideoEvidence[]) => void
}

export default function EvidenceManager({ photos, videos, markers, onPhotosChange, onVideosChange }: EvidenceManagerProps) {
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
    const [editingPhoto, setEditingPhoto] = useState<PhotoEvidence | null>(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const [editingVideo, setEditingVideo] = useState<VideoEvidence | null>(null)

    const handlePhotoSave = (evidence: PhotoEvidence) => {
        if (editingPhoto) {
            onPhotosChange(photos.map(p => p.id === evidence.id ? evidence : p))
        } else {
            onPhotosChange([...photos, evidence])
        }
        setEditingPhoto(null)
    }

    const removePhoto = (id: string) => {
        onPhotosChange(photos.filter(p => p.id !== id))
    }

    const editPhoto = (photo: PhotoEvidence) => {
        setEditingPhoto(photo)
        setIsPhotoModalOpen(true)
    }

    const handleVideoSave = (evidence: VideoEvidence) => {
        if (editingVideo) {
            onVideosChange(videos.map(v => v.id === evidence.id ? evidence : v))
        } else {
            onVideosChange([...videos, evidence])
        }
        setEditingVideo(null)
    }

    const removeVideo = (id: string) => {
        onVideosChange(videos.filter(v => v.id !== id))
    }

    const editVideo = (video: VideoEvidence) => {
        setEditingVideo(video)
        setIsVideoModalOpen(true)
    }

    return (
        <div className="space-y-8">
            <PhotoEvidenceModal
                isOpen={isPhotoModalOpen}
                onClose={() => {
                    setIsPhotoModalOpen(false)
                    setEditingPhoto(null)
                }}
                onSave={handlePhotoSave}
                initialData={editingPhoto}
                availableMarkers={markers}
            />

            <VideoEvidenceModal
                isOpen={isVideoModalOpen}
                onClose={() => {
                    setIsVideoModalOpen(false)
                    setEditingVideo(null)
                }}
                onSave={handleVideoSave}
                initialData={editingVideo}
                availableMarkers={markers}
            />

            {/* Photos Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest flex items-center gap-2">
                        <ImageIcon size={14} />
                        Photo Locker
                    </label>
                    <Button
                        onClick={() => setIsPhotoModalOpen(true)}
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                    >
                        New Entry
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {photos.map((photo, index) => {
                        const capturedBy = photo.capturedBy.type === 'INTERNAL'
                            ? (MOCK_AGENTS.find(a => a.id === photo.capturedBy.officerId)?.name || 'Unknown Officer')
                            : photo.capturedBy.externalDetails?.fullName

                        return (
                            <div key={photo.id} className="group relative flex flex-col bg-slate-900/40 rounded border border-white/5 hover:border-primary/20 transition-all overflow-hidden p-3">
                                <div className="flex gap-4">
                                    <div className="relative aspect-square w-20 bg-black rounded border border-border overflow-hidden shrink-0">
                                        <img src={photo.fileUrl} alt={photo.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-0 left-0 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br">
                                            E{index + 1} PHOTO
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="text-[11px] font-black text-white uppercase tracking-tight truncate mb-0.5">
                                                "{photo.title}"
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => editPhoto(photo)} className="text-white/40 hover:text-primary transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                                <button onClick={() => removePhoto(photo.id)} className="text-white/40 hover:text-red-500 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-[9px] text-white/50 space-y-0.5 font-mono uppercase tracking-tighter">
                                            <div>Taken: {new Date(photo.timestamp).toLocaleString()}</div>
                                            <div>By: <span className="text-primary/70">{capturedBy}</span></div>
                                        </div>

                                        {photo.linkedMarkerIds.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {photo.linkedMarkerIds.map(mid => (
                                                    <span key={mid} className="text-[8px] px-1 bg-primary/20 text-primary border border-primary/20 rounded font-mono">
                                                        {mid}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {photos.length === 0 && (
                        <div className="border border-dashed border-border/40 rounded-lg p-6 text-center bg-slate-900/20">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">No Photos Registered</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Videos Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest flex items-center gap-2">
                        <Video size={14} />
                        Video Locker
                    </label>
                    <Button
                        onClick={() => setIsVideoModalOpen(true)}
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                    >
                        New Entry
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {videos.map((video, index) => {
                        const capturedBy = video.capturedBy.type === 'INTERNAL'
                            ? (MOCK_AGENTS.find(a => a.id === video.capturedBy.officerId)?.name || 'Unknown Officer')
                            : video.capturedBy.externalDetails?.fullName

                        return (
                            <div key={video.id} className="group relative flex flex-col bg-slate-900/40 rounded border border-white/5 hover:border-primary/20 transition-all overflow-hidden p-3">
                                <div className="flex gap-4">
                                    <div className="relative aspect-square w-20 bg-black rounded border border-border flex items-center justify-center shrink-0">
                                        <Video size={24} className="text-primary/20" />
                                        <div className="absolute top-0 left-0 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br">
                                            V{index + 1} VIDEO
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="text-[11px] font-black text-white uppercase tracking-tight truncate mb-0.5">
                                                "{video.title}"
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => editVideo(video)} className="text-white/40 hover:text-primary transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                                <button onClick={() => removeVideo(video.id)} className="text-white/40 hover:text-red-500 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-[9px] text-white/50 space-y-0.5 font-mono uppercase tracking-tighter">
                                            <div>Taken: {new Date(video.timestamp).toLocaleString()}</div>
                                            <div>By: <span className="text-primary/70">{capturedBy}</span></div>
                                            <div>Source: <span className="opacity-80">{video.sourceType === 'OTHER' ? video.otherSourceText : video.sourceType}</span></div>
                                        </div>

                                        {video.linkedMarkerIds.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {video.linkedMarkerIds.map(mid => (
                                                    <span key={mid} className="text-[8px] px-1 bg-primary/20 text-primary border border-primary/20 rounded font-mono">
                                                        {mid}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {videos.length === 0 && (
                        <div className="border border-dashed border-border/40 rounded-lg p-6 text-center bg-slate-900/20">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">No Videos Registered</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
