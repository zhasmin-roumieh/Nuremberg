import { MapPin, Plus, Check, Clock, Globe, Phone, ExternalLink, RefreshCw } from 'lucide-react'
import { calcDistance, formatDistance } from '../lib/utils'
import { placeGoogleMapsUrl } from '../lib/routing'

const CAT_COLORS = { food:'#f59e0b', tourist:'#3b82f6', history:'#8b5cf6', shopping:'#10b981' }
const CAT_EMOJI  = { food:'🍽️', tourist:'🏛️', history:'⚔️', shopping:'🛍️' }

export default function PlacesList({ places, loading, error, activePlace, setActivePlace, isInRoute, togglePlaceInRoute, userLocation, onRetry }) {
  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!places.length) return <EmptyState />

  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium">{places.length} place{places.length !== 1 ? 's' : ''} found</p>
      <div className="divide-y divide-gray-50">
        {places.map(place => (
          <PlaceCard key={place.id} place={place}
            isActive={activePlace?.id === place.id}
            inRoute={isInRoute(place)}
            onSelect={() => setActivePlace(p => p?.id === place.id ? null : place)}
            onToggleRoute={() => togglePlaceInRoute(place)}
            userLocation={userLocation} />
        ))}
      </div>
    </div>
  )
}

function PlaceCard({ place, isActive, inRoute, onSelect, onToggleRoute, userLocation }) {
  const dist  = userLocation ? formatDistance(calcDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)) : null
  const color = CAT_COLORS[place.category] || '#6b7280'

  return (
    <div onClick={onSelect}
      className={`px-4 py-3.5 cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <div className="flex items-start gap-3">

        {/* Color dot */}
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
          style={{ background: inRoute ? '#FEE2E2' : '#F9FAFB', border: `2px solid ${inRoute ? '#C8102E' : '#E5E7EB'}` }}>
          {CAT_EMOJI[place.category] || '📍'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug">{place.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {place.subtype?.replace(/_/g, ' ')}
                {place.cuisine && <> · <span className="text-gray-500">{capitalize(place.cuisine)}</span></>}
                {place.priceRange && <> · {place.priceRange}</>}
              </p>
            </div>

            <button onClick={e => { e.stopPropagation(); onToggleRoute() }}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${inRoute ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              {inRoute ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {dist && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={10} /> {dist}
              </span>
            )}
            {place.fee === 'no' && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md">Free</span>}
            {place.fee === 'yes' && <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-md">Paid</span>}
            {place.dietVegan === 'yes' && <span className="text-xs text-green-600 font-medium">🌱 Vegan</span>}
            {place.dietVegetarian === 'yes' && !place.dietVegan && <span className="text-xs text-green-600 font-medium">🥗 Vegetarian</span>}
            {place.openingHours && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={10} /> {trunc(place.openingHours, 26)}
              </span>
            )}
          </div>

          {isActive && (
            <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-2.5">
              {place.address && <p className="text-xs text-gray-500">{place.address}</p>}
              {place.description && <p className="text-xs text-gray-500 italic leading-relaxed">{trunc(place.description, 140)}</p>}
              <div className="flex gap-2 flex-wrap">
                <a href={placeGoogleMapsUrl(place)} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
                  <ExternalLink size={11} /> Open in Maps
                </a>
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <Globe size={11} /> Website
                  </a>
                )}
                {place.phone && (
                  <a href={`tel:${place.phone}`} onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <Phone size={11} /> Call
                  </a>
                )}
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
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="w-9 h-9 border-[3px] border-gray-200 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Finding places…</p>
      <p className="text-xs text-gray-400">Searching OpenStreetMap data</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Could not load places</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-2">
      <div className="text-4xl mb-1">🔍</div>
      <p className="font-semibold text-gray-800 text-sm">No results yet</p>
      <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
        Pick a category, set your filters and tap <strong>Find Places</strong> to explore Nuremberg
      </p>
    </div>
  )
}

function capitalize(s) { return s?.split(';')[0].trim().replace(/\b\w/g, c => c.toUpperCase()) || '' }
function trunc(s, n)   { return s && s.length > n ? s.slice(0, n) + '…' : s }
