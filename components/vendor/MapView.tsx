'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'

export default function MapView({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} className='h-full w-full'>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={[lat, lng]} />
    </MapContainer>
  )
}
