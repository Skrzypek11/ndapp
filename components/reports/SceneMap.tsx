"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapPin } from 'lucide-react'
import { Marker as MarkerType, MarkerColor, Shape, ShapeType } from '@/lib/store/reports'

// Fix for leaflet-draw internal reference to window/global
if (typeof window !== 'undefined') {
    require('leaflet-draw')
}

interface SceneMapProps {
    markers: MarkerType[]
    shapes?: Shape[]
    onMarkerAdd?: (x: number, y: number) => void
    onMarkerUpdate?: (updates: Partial<MarkerType>) => void
    onMarkerClick?: (marker: MarkerType) => void
    onShapeAdd?: (shape: Omit<Shape, 'id'>) => void
    onShapeClick?: (shape: Shape) => void
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

const MAP_SIZE = 4096
const IMAGE_BOUNDS: L.LatLngBoundsExpression = [[0, 0], [MAP_SIZE, MAP_SIZE]]

export default function SceneMap({
    markers,
    shapes = [],
    onMarkerAdd,
    onMarkerClick,
    onShapeAdd,
    onShapeClick,
    editable = true
}: SceneMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<L.Map | null>(null)
    const markersRef = useRef<{ [id: string]: L.Marker }>({})
    const shapesRef = useRef<{ [id: string]: L.Layer }>({})
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null)

    // Icon Factory
    const createIcon = (color: MarkerColor = 'red', id: string, title?: string) => {
        const hex = PALETTE[color] || PALETTE.red
        const isLight = color === 'white' || color === 'yellow'

        const label = !editable && title ? `${id} — ${title}` : id

        const iconHtml = renderToStaticMarkup(
            <div className="relative group">
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: hex,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    color: isLight ? 'black' : 'white'
                }}>
                    <MapPin size={18} />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-bold border border-white/20 whitespace-nowrap shadow-xl uppercase font-mono tracking-tighter">
                    {label}
                </div>
            </div>
        )

        return L.divIcon({
            html: iconHtml,
            className: 'custom-map-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return

        const map = L.map(mapContainerRef.current, {
            crs: L.CRS.Simple,
            minZoom: -2,
            maxZoom: 2,
            zoom: -1,
            center: [MAP_SIZE / 2, MAP_SIZE / 2],
            attributionControl: false,
            maxBounds: IMAGE_BOUNDS,
            maxBoundsViscosity: 1.0
        })

        L.imageOverlay('/map/gta_tactical.png', IMAGE_BOUNDS).addTo(map)

        // Drawing Layer
        const drawnItems = new L.FeatureGroup()
        map.addLayer(drawnItems)
        drawnItemsRef.current = drawnItems

        if (editable) {
            // Setup Leaflet Draw
            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    remove: false, // We handle deletion via our own logic/modal
                    edit: false    // We handle updates via our own logic
                },
                draw: {
                    marker: true,
                    polyline: { shapeOptions: { color: '#ef4444' } },
                    polygon: { shapeOptions: { color: '#ef4444' } },
                    rectangle: { shapeOptions: { color: '#ef4444' } },
                    circle: { shapeOptions: { color: '#ef4444' } },
                    circlemarker: false
                } as any
            })

            map.addControl(drawControl)

            map.on(L.Draw.Event.CREATED, (e: any) => {
                const layer = e.layer
                const type = e.layerType

                // REMOVE THE LAYER IMMEDIATELY. 
                // We extract data first. The loop in useEffect will re-add it as state-driven.
                layer.remove()

                if (type === 'marker') {
                    const latlng = layer.getLatLng()
                    if (onMarkerAdd) onMarkerAdd(latlng.lng, latlng.lat)
                } else if (onShapeAdd) {
                    let coords: { x: number; y: number }[] = []
                    let radius: number | undefined

                    if (type === 'circle') {
                        const latlng = layer.getLatLng()
                        coords = [{ x: latlng.lng, y: latlng.lat }]
                        radius = layer.getRadius()
                    } else if (type === 'rectangle') {
                        const latlngs = (layer.getLatLngs()[0] as any) as L.LatLng[]
                        coords = latlngs.map(l => ({ x: l.lng, y: l.lat }))
                    } else {
                        const latlngs = layer.getLatLngs() as L.LatLng[] | L.LatLng[][]
                        const flat = Array.isArray(latlngs[0]) ? (latlngs[0] as L.LatLng[]) : (latlngs as L.LatLng[])
                        coords = flat.map(l => ({ x: l.lng, y: l.lat }))
                    }

                    onShapeAdd({
                        type: type as ShapeType,
                        coords,
                        radius,
                        color: '#ef4444'
                    })
                }
            })
        } else {
            // Point marker click on map might still be useful if we want to show something, 
            // but let's stick to markers/shapes interactions
        }

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    // Synchronize markers
    useEffect(() => {
        if (!mapRef.current) return
        const map = mapRef.current
        const currentMarkers = markersRef.current

        markers.forEach(m => {
            // Safety check: coordinates must be valid numbers
            // Fallback for transition from lat/lng to x/y
            const x = typeof m.x === 'number' ? m.x : (m as any).lng
            const y = typeof m.y === 'number' ? m.y : (m as any).lat

            if (typeof x !== 'number' || typeof y !== 'number') {
                console.warn(`[SceneMap] Invalid coordinates for marker ${m.id}:`, m)
                return // Skip this marker to prevent crash
            }

            const existing = currentMarkers[m.id]
            const icon = createIcon(m.color, m.id, m.title)

            if (existing) {
                existing.setLatLng([y, x])
                existing.setIcon(icon)
            } else {
                const newMarker = L.marker([y, x], { icon }).addTo(map)
                newMarker.on('click', (e) => {
                    L.DomEvent.stopPropagation(e)
                    if (onMarkerClick) onMarkerClick(m)
                })
                currentMarkers[m.id] = newMarker
            }
        })

        Object.keys(currentMarkers).forEach(id => {
            if (!markers.find(m => m.id === id)) {
                currentMarkers[id].remove()
                delete currentMarkers[id]
            }
        })
    }, [markers, onMarkerClick, editable])

    // Synchronize shapes
    useEffect(() => {
        if (!mapRef.current) return
        const map = mapRef.current
        const currentShapes = shapesRef.current

        shapes.forEach(s => {
            const existing = currentShapes[s.id]

            if (existing) {
                // For simplicity, we remove and re-add if details changed significantly,
                // but let's just check color for now.
                // In a real app we might update geometry.
                existing.remove()
            }

            let newLayer: L.Layer
            const latlngs = s.coords
                .map(c => {
                    const x = typeof c.x === 'number' ? c.x : (c as any).lng
                    const y = typeof c.y === 'number' ? c.y : (c as any).lat
                    if (typeof x !== 'number' || typeof y !== 'number') return null
                    return L.latLng(y, x)
                })
                .filter((l): l is L.LatLng => l !== null)

            if (latlngs.length === 0) {
                console.warn(`[SceneMap] Shape ${s.id} has no valid coordinates. skipping.`)
                return
            }

            if (s.type === 'polyline') {
                newLayer = L.polyline(latlngs, { color: s.color })
            } else if (s.type === 'circle') {
                newLayer = L.circle(latlngs[0], { radius: s.radius, color: s.color })
            } else if (s.type === 'rect') {
                // bounds from coords
                const bounds = L.latLngBounds(latlngs)
                newLayer = L.rectangle(bounds, { color: s.color })
            } else {
                newLayer = L.polygon(latlngs, { color: s.color })
            }

            newLayer.addTo(map)

            if (s.title) {
                newLayer.bindTooltip(`${s.id}: ${s.title}`, {
                    permanent: !editable,
                    direction: 'top',
                    className: 'tactical-tooltip'
                })
            }

            newLayer.on('click', (e) => {
                L.DomEvent.stopPropagation(e)
                if (onShapeClick) onShapeClick(s)
            })
            currentShapes[s.id] = newLayer
        })

        Object.keys(currentShapes).forEach(id => {
            if (!shapes.find(s => s.id === id)) {
                currentShapes[id].remove()
                delete currentShapes[id]
            }
        })
    }, [shapes, onShapeClick])

    return (
        <div className="relative h-full w-full rounded border border-border overflow-hidden bg-[#0a0a0a]">
            <div ref={mapContainerRef} className="h-full w-full" />
            <div className="absolute top-2 left-2 z-[400] bg-black/70 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-[10px] text-white/80 uppercase tracking-wider font-bold shadow-xl pointer-events-none">
                Tactical Uplink: {editable ? 'Operational' : 'Analysis Mode'}
            </div>
        </div>
    )
}
