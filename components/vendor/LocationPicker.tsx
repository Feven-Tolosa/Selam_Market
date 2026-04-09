'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import { LeafletMouseEvent } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

//  Type-safe fix (no any)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

type Props = {
  lat: number | null
  lng: number | null
  onSelect: (lat: number, lng: number) => void
}

function LocationMarker({ lat, lng, onSelect }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null,
  )

  useMapEvents({
    click(e: LeafletMouseEvent) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(coords)
      onSelect(coords[0], coords[1])
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function LocationPicker({ lat, lng, onSelect }: Props) {
  const center: [number, number] = [lat || 9.03, lng || 38.74]

  return (
    <MapContainer center={center} zoom={13} className='h-64 w-full rounded-xl'>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

      <LocationMarker lat={lat} lng={lng} onSelect={onSelect} />
    </MapContainer>
  )
}
