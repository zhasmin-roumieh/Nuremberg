import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CAT_COLORS = {
  food:     '#f59e0b',
  tourist:  '#3b82f6',
  history:  '#8b5cf6',
  shopping: '#10b981',
}

const CAT_EMOJI = {
  food:     '🍽️',
  tourist:  '🏛️',
  history:  '⚔️',
  shopping: '🛍️',
}

function makeIcon(emoji, color, active = false, inRoute = false) {
  const bg   = inRoute ? '#C8102E' : color
  const size = active ? 44 : 36
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};
      border:2.5px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.44)}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.28);
      cursor:pointer;
    ">${emoji}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Moves the map when location or active place changes
function MapController({ userLocation, activePlace }) {
  const map = useMap()

  useEffect(() => {
    if (userLocation)
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 })
  }, [userLocation])  // eslint-disable-line

  useEffect(() => {
    if (activePlace)
      map.flyTo([activePlace.lat, activePlace.lng], 17, { duration: 1 })
  }, [activePlace])  // eslint-disable-line

  return null
}

export default function MapView({
  center, userLocation, places,
  selectedPlaces, activePlace, onPlaceClick,
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl
    >
      {/* CartoDB Voyager tiles — free, no key, looks like Google Maps */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      <MapController userLocation={userLocation} activePlace={activePlace} />

      {/* User location — blue dot */}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={9}
          pathOptions={{
            color: 'white', weight: 3,
            fillColor: '#2563eb', fillOpacity: 1,
          }}
        />
      )}

      {/* Place markers */}
      {places.map(place => {
        const inRoute  = selectedPlaces.some(p => p.id === place.id)
        const isActive = activePlace?.id === place.id

        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={makeIcon(
              CAT_EMOJI[place.category] || '📍',
              CAT_COLORS[place.category] || '#6b7280',
              isActive,
              inRoute,
            )}
            zIndexOffset={isActive ? 1000 : inRoute ? 500 : 0}
            eventHandlers={{ click: () => onPlaceClick(place) }}
          />
        )
      })}
    </MapContainer>
  )
}
