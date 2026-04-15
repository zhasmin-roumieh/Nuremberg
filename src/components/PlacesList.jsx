import { MapPin, Plus, Check, ExternalLink, Star } from 'lucide-react'
import { calcDistance, formatDistance } from '../lib/utils'
import { placeGoogleMapsUrl } from '../lib/routing'

const CAT_EMOJI = {
  food:     '🍽️',
  tourist:  '🏛️',
  history:  '⚔️',
  shopping: '🛍️',
}

export default function PlacesList({
  places, loading, error,
  activePlace, setActivePlace,
  isInRoute, togglePlaceInRoute,
  userLocation,
}) {
  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />
  if (!places.length) return <EmptyState />

  return (
    <div className="divide-y divide-gray-100">
      {places.map(place => (
        <PlaceCard
          key={place.id}
          place={place}
          isActive={activePlace?.id === place.id}
          inRoute={isInRoute(place)}
          onSelect={() => setActivePlace(p => p?.id === place.id ? null : place)}
          onToggleRoute={() => togglePlaceInRoute(place)}
          userLocation={userLocation}
        />
      ))}
    </div>
  )
}

function PlaceCard({ place, isActive, inRoute, onSelect, onToggleRoute, userLocation }) {
  const dist = userLocation
    ? formatDistance(calcDistance(userLocation.lat, userLocation.lng, place.lat, place.lng))
    : null

  return (
    <div
      className={`transition-colors cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
      onClick={onSelect}
    >
      {/* Photo strip (only when expanded) */}
      {isActive && place.photo && (
        <img
          src={place.photo}
          alt={place.name}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      )}

      <div className="px-4 py-3 flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
          ${inRoute ? 'bg-primary-100' : 'bg-gray-100'}`}
        >
          {CAT_EMOJI[place.category] || '📍'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug">{place.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">
                {place.subtype}
                {place.priceRange && ` · ${place.priceRange}`}
              </p>
            </div>

            {/* Add to route */}
            <button
              onClick={e => { e.stopPropagation(); onToggleRoute() }}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${inRoute
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              title={inRoute ? 'Remove from route' : 'Add to route'}
            >
              {inRoute ? <Check size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {dist && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} /> {dist}
              </span>
            )}
            {place.rating != null && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star size={11} fill="currentColor" />
                {place.rating.toFixed(1)}
                {place.ratingsTotal != null && (
                  <span className="text-gray-400 font-normal">({place.ratingsTotal.toLocaleString()})</span>
                )}
              </span>
            )}
            {place.openNow === true  && <span className="text-xs text-green-600 font-medium">Open now</span>}
            {place.openNow === false && <span className="text-xs text-red-500 font-medium">Closed</span>}
          </div>

          {/* Expanded details */}
          {isActive && (
            <div className="mt-2 space-y-1.5">
              {place.address && (
                <p className="text-xs text-gray-500">{place.address}</p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <a
                  href={placeGoogleMapsUrl(place)}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <ExternalLink size={11} /> Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Finding places near you…</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
      <span className="text-3xl">⚠️</span>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
      <span className="text-4xl">🔍</span>
      <p className="font-medium text-gray-700">No results yet</p>
      <p className="text-sm text-gray-500">Choose a category and tap "Find Places" to explore Nuremberg!</p>
    </div>
  )
}
