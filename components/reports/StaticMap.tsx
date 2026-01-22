"use client"

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react"
import { Marker, MarkerColor } from "@/lib/store/reports"
import { MapPin } from "lucide-react"

interface StaticMapProps {
    markers: Marker[]
    onMarkerAdd?: (x: number, y: number) => void
    onMarkerClick?: (marker: Marker) => void
    editable?: boolean
}

const PALETTE: Record<MarkerColor, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    green: '#22c55e',
    orange: '#f97316',
    purple: '#a855f7',
    black: '#1f2937',
    white: '#f3f4f6'
}

export default function StaticMap({ markers, onMarkerAdd, onMarkerClick, editable = true }: StaticMapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [hasMoved, setHasMoved] = useState(false)
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 })

    const clampOffset = (x: number, y: number, currentImgSize = imgSize) => {
        if (!containerRef.current || currentImgSize.width === 0) return { x, y }

        const container = containerRef.current.getBoundingClientRect()

        // Horizontal clamping
        const minX = container.width - currentImgSize.width
        const maxX = 0
        const clampedX = currentImgSize.width <= container.width ? maxX : Math.min(maxX, Math.max(minX, x))

        // Vertical clamping
        const minY = container.height - currentImgSize.height
        const maxY = 0
        const clampedY = currentImgSize.height <= container.height ? maxY : Math.min(maxY, Math.max(minY, y))

        return { x: clampedX, y: clampedY }
    }

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget
        const container = containerRef.current?.getBoundingClientRect()

        if (!container) return

        // We want the image to at least cover the container.
        // We'll scale it to cover, then add a bit extra for panning if it fits perfectly.
        const naturalWidth = img.naturalWidth
        const naturalHeight = img.naturalHeight
        const ratio = naturalWidth / naturalHeight

        let renderedWidth = container.width
        let renderedHeight = renderedWidth / ratio

        if (renderedHeight < container.height) {
            renderedHeight = container.height
            renderedWidth = renderedHeight * ratio
        }

        // Add a "tactical zoom" (1.5x) to make it pannable if requested or just use natural size if preferred.
        // For now, let's ensure it covers and is at least 1.2x container size to give some pan freedom.
        const zoomFactor = 1.4
        renderedWidth *= zoomFactor
        renderedHeight *= zoomFactor

        setImgSize({ width: renderedWidth, height: renderedHeight })

        // Initial centering
        const initialX = (container.width - renderedWidth) / 2
        const initialY = (container.height - renderedHeight) / 2
        setOffset({ x: initialX, y: initialY })
    }

    const handleMouseDown = (e: MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
        setHasMoved(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y

        const clamped = clampOffset(newX, newY)
        setOffset(clamped)
        setHasMoved(true)
    }

    const handleMouseUp = (e: MouseEvent) => {
        setIsDragging(false)

        // If it was a simple click (not a drag), and we are in editable mode, add a marker
        if (!hasMoved && editable && onMarkerAdd && containerRef.current && imgSize.width > 0) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = ((e.clientX - rect.left - offset.x) / imgSize.width) * 100
            const y = ((e.clientY - rect.top - offset.y) / imgSize.height) * 100
            onMarkerAdd(x, y)
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-[#0a0a0a] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
        >
            <div
                className="absolute transition-transform duration-75 ease-out"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    width: imgSize.width || '100%',
                    height: imgSize.height || 'auto'
                }}
            >
                {/* The Map Image */}
                <img
                    ref={imgRef}
                    src="/map/gta.png"
                    alt="Tactical Map"
                    className="block pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                    onLoad={handleImageLoad}
                    draggable={false}
                />

                {/* Markers */}
                {markers.map((marker) => (
                    <div
                        key={marker.id}
                        className="absolute cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        style={{
                            left: `${marker.x}%`,
                            top: `${marker.y}%`,
                            transform: 'translate(-50%, -100%)', // Center bottom of pin on coordinate
                            zIndex: 10
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (onMarkerClick) onMarkerClick(marker)
                        }}
                    >
                        <div className="relative group">
                            <MapPin
                                size={24}
                                fill={PALETTE[marker.color]}
                                color="white"
                                strokeWidth={2}
                                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-bold border border-white/20 whitespace-nowrap pointer-events-none shadow-xl uppercase font-mono tracking-tighter">
                                {marker.id}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* UI Overlay */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 shadow-xl">
                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">Satellite Uplink 102-B</span>
                    <div className="text-[8px] text-white/40 font-mono mt-0.5 tabular-nums">
                        OFF: {Math.round(offset.x)}, {Math.round(offset.y)}
                    </div>
                </div>
            </div>

            {editable && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full shadow-2xl pointer-events-none animation-pulse">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Click to place Intel</span>
                </div>
            )}
        </div>
    )
}
