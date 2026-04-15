import { useEffect, useRef, useCallback } from 'react'
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  CircleF,
} from '@react-google-maps/api'

const LIBRARIES = ['places']

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

// Subtle map style — de-emphasises POI clutter so our markers stand out
const MAP_STYLE = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

export default function MapView({
  apiKey,
  center,
  userLocation,
  places,
  selectedPlaces,
  activePlace,
  onPlaceClick,
  onApiReady,
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  })

  // Notify parent once API is ready (enables the Search button)
  useEffect(() => {
    if (isLoaded) onApiReady?.()
  }, [isLoaded, onApiReady])

  if (loadError) return <MapError />
  if (!isLoaded) return <MapLoading />

  return (
    <MapContent
      center={center}
      userLocation={userLocation}
      places={places}
      selectedPlaces={selectedPlaces}
      activePlace={activePlace}
      onPlaceClick={onPlaceClick}
    />
  )
}

function MapContent({ center, userLocation, places, selectedPlaces, activePlace, onPlaceClick }) {
  const mapRef = useRef(null)

  const onLoad = useCallback(map => {
    mapRef.current = map
  }, [])

  // Fly to user when location changes
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng })
      mapRef.current.setZoom(15)
    }
  }, [userLocation])

  // Fly to active place
  useEffect(() => {
    if (mapRef.current && activePlace) {
      mapRef.current.panTo({ lat: activePlace.lat, lng: activePlace.lng })
      mapRef.current.setZoom(17)
    }
  }, [activePlace])

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat: center.lat, lng: center.lng }}
      zoom={14}
      onLoad={onLoad}
      options={{
        styles: MAP_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {/* User location blue dot */}
      {userLocation && (
        <>
          <MarkerF
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            zIndex={100}
          />
          <CircleF
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            radius={40}
            options={{
              fillColor: '#2563eb',
              fillOpacity: 0.12,
              strokeColor: '#2563eb',
              strokeOpacity: 0.3,
              strokeWeight: 1,
            }}
          />
        </>
      )}

      {/* Place markers */}
      {places.map(place => {
        const inRoute  = selectedPlaces.some(p => p.id === place.id)
        const isActive = activePlace?.id === place.id
        const color    = inRoute ? '#C8102E' : CAT_COLORS[place.category] || '#6b7280'

        return (
          <MarkerF
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => onPlaceClick(place)}
            zIndex={isActive ? 50 : inRoute ? 20 : 10}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: isActive ? 14 : inRoute ? 12 : 10,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2.5,
            }}
            label={{
              text: CAT_EMOJI[place.category] || '📍',
              fontSize: isActive ? '16px' : '13px',
              className: 'marker-label',
            }}
          />
        )
      })}
    </GoogleMap>
  )
}

function MapLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  )
}

function MapError() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
      <p className="text-sm text-red-600 px-6 text-center">
        Could not load Google Maps. Check your API key in the <code>.env</code> file.
      </p>
    </div>
  )
}
