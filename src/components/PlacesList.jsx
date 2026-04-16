import { MapPin, Plus, Check, Globe, Phone, ExternalLink, RefreshCw, Star, BookOpen } from 'lucide-react'
import { calcDistance, formatDistance } from '../lib/utils'
import { placeGoogleMapsUrl } from '../lib/routing'

const CAT_EMOJI = { food:'🍽️', tourist:'🏛️', history:'⚔️', shopping:'🛍️' }
const CAT_BG    = { food:'bg-amber-50', tourist:'bg-blue-50', history:'bg-purple-50', shopping:'bg-emerald-50' }
const CAT_TEXT  = { food:'text-amber-600', tourist:'text-blue-600', history:'text-purple-600', shopping:'text-emerald-600' }

export default function PlacesList({ places, loading, error, activePlace, setActivePlace, isInRoute, togglePlaceInRoute, userLocation, onRetry }) {
  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!places.length) return <EmptyState />

  return (
    <div>
      <p className="px-4 pt-3 pb-2 text-xs text-gray-400 font-medium">
        {places.length} place{places.length !== 1 ? 's' : ''} found
      </p>
      <div className="space-y-px">
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
  const dist      = userLocation ? formatDistance(calcDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)) : null
  const isWiki    = !!place.description   // Wikipedia places always have a description
  const catBg     = CAT_BG[place.category]   || 'bg-gray-50'
  const catText   = CAT_TEXT[place.category] || 'text-gray-600'

  return (
    <div onClick={onSelect}
      className={`px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50
        ${isActive ? 'bg-indigo-50/60' : 'bg-white hover:bg-gray-50/80'}`}>

      <div className="flex gap-3">
        {/* Left: photo (Wikipedia) or emoji icon */}
        <div className="flex-shrink-0">
          {place.photo && !isActive ? (
            <img src={place.photo} alt={place.name}
              className="w-14 h-14 rounded-2xl object-cover shadow-sm" loading="lazy" />
          ) : (
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${catBg}
              ${inRoute ? 'ring-2 ring-primary-400' : ''}`}>
              {CAT_EMOJI[place.category] || '📍'}
            </div>
          )}
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm leading-snug">{place.name}</p>

              {/* Description preview (Wikipedia only, collapsed) */}
              {isWiki && !isActive && place.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              )}

              {/* Subtype + price row */}
              {!isWiki && (
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {place.subtype?.replace(/_/g,' ')}
                  {place.cuisine && <> · {cap(place.cuisine)}</>}
                  {place.priceRange && <> · <span className="font-medium">{place.priceRange}</span></>}
                </p>
              )}
            </div>

            {/* Add to route */}
            <button onClick={e => { e.stopPropagation(); onToggleRoute() }}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mt-0.5
                ${inRoute ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              {inRoute ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {dist && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={10} /> {dist}
              </span>
            )}
            {isWiki && (
              <span className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${catBg} ${catText}`}>
                <BookOpen size={9} />
                {place.subtype?.replace(/_/g,' ')}
              </span>
            )}
            {place.fee === 'no'  && <Badge color="emerald">Free entry</Badge>}
            {place.fee === 'yes' && <Badge color="amber">Paid entry</Badge>}
            {place.rating != null && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Star size={10} fill="currentColor" /> {place.rating}
              </span>
            )}
            {place.openNow === true  && <Badge color="emerald">Open now</Badge>}
            {place.openNow === false && <Badge color="red">Closed</Badge>}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isActive && (
        <div className="mt-3 space-y-3">
          {/* Full-width photo when expanded */}
          {place.photo && (
            <img src={place.photo} alt={place.name}
              className="w-full h-44 object-cover rounded-2xl shadow-sm" loading="lazy" />
          )}

          {/* Full description */}
          {place.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
          )}

          {place.address && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={11} /> {place.address}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap pt-1">
            <a href={placeGoogleMapsUrl(place)} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600">
              <ExternalLink size={11} /> Google Maps
            </a>
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                {isWiki ? <BookOpen size={11} /> : <Globe size={11} />}
                {isWiki ? 'Wikipedia' : 'Website'}
              </a>
            )}
            {place.phone && (
              <a href={`tel:${place.phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                <Phone size={11} /> Call
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ color, children }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    red:     'bg-red-50 text-red-600',
  }
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${styles[color] || ''}`}>
      {children}
    </span>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="w-9 h-9 border-[3px] border-gray-100 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Finding places…</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Could not load places</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
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
        Choose a category and tap <strong>Find Places</strong> to explore Nuremberg
      </p>
    </div>
  )
}

const cap = s => s?.split(';')[0].trim().replace(/\b\w/g, c => c.toUpperCase()) || ''
