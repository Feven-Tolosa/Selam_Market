'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Vendor } from '@/types'

interface Props {
  vendors: Vendor[]
}

export default function VendorsMap({ vendors }: Props) {
  return (
    <MapContainer
      center={[9.03, 38.74]} // Addis Ababa default
      zoom={13}
      className='h-[400px] w-full rounded-lg'
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {vendors.map((vendor) => (
        <Marker key={vendor.id} position={[vendor.latitude, vendor.longitude]}>
          <Popup>
            <strong>{vendor.store_name}</strong>
            <br />
            {vendor.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
