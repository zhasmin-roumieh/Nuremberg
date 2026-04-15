import { useState, useRef, useEffect, useCallback } from 'react'
import { Map, Route, Navigation, Search, X, MapPin } from 'lucide-react'
import { geocode } from '../lib/geocode'

export default function TopBar({
  locating, onLocate, userLocation,
  routeCount, onShowRoute,
  onSetLocation,
}) {
  const [showSearch, setShowSearch]   = useState(false)
  const [query, setQuery]             = useState('')
  const [results, setResults]         = useState([])
  const [searching, setSearching]     = useState(false)
  const [manualLabel, setManualLabel] = useState(null)
  const inputRef  = useRef(null)
  const timerRef  = useRef(null)

  // Focus input when panel opens
  useEffect(() => {
    if (showSearch) inputRef.current?.focus()
  }, [showSearch])

  // Debounced Nominatim search
  const handleInput = useCallback((e) => {
    const val = e.target.value
    setQuery(val)
    setResults([])
    clearTimeout(timerRef.current)
    if (val.trim().length < 2) return
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await geocode(val)
        setResults(res)
      } catch {
        // silently fail
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [])

  const pickResult = useCallback((r) => {
    onSetLocation({ lat: r.lat, lng: r.lng })
    setManualLabel(r.label)
    setQuery('')
    setResults([])
    setShowSearch(false)
  }, [onSetLocation])

  const clearManual = useCallback(() => {
    setManualLabel(null)
    onLocate() // fall back to GPS
  }, [onLocate])

  const closeSearch = () => {
    setShowSearch(false)
    setQuery('')
    setResults([])
  }

  return (
    <div className="bg-white shadow-sm z-10">
      {/* ── Main row ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Map size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Nuremberg</h1>
            <p className="text-[10px] text-gray-400 leading-tight">City Explorer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Route button */}
          {routeCount > 0 && (
            <button
              onClick={onShowRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg shadow"
            >
              <Route size={15} />
              Route
              <span className="bg-white text-primary-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {routeCount}
              </span>
            </button>
          )}

          {/* GPS locate */}
          <button
            onClick={onLocate}
            disabled={locating}
            title="Use my GPS location"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors
              ${userLocation && !manualLabel
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              } disabled:opacity-60`}
          >
            {locating
              ? <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              : <Navigation size={15} />
            }
            <span className="hidden sm:inline">
              {locating ? 'Locating…' : 'GPS'}
            </span>
          </button>

          {/* Manual location toggle */}
          <button
            onClick={() => showSearch ? closeSearch() : setShowSearch(true)}
            title="Type a location manually"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors
              ${showSearch || manualLabel
                ? 'bg-primary-50 border-primary-300 text-primary-600'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
          >
            <MapPin size={15} />
            <span className="hidden sm:inline">Type location</span>
          </button>
        </div>
      </div>

      {/* ── Manual location label (when set) ─────────────────── */}
      {manualLabel && !showSearch && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <MapPin size={13} className="text-primary-500 flex-shrink-0" />
          <p className="text-xs text-primary-700 font-medium truncate flex-1">{manualLabel}</p>
          <button
            onClick={clearManual}
            className="text-gray-400 hover:text-gray-600"
            title="Clear manual location"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Search panel ─────────────────────────────────────── */}
      {showSearch && (
        <div className="px-4 pb-3 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Type an address or place in Nuremberg…"
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {(results.length > 0 || searching) && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
              {searching && (
                <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                  Searching…
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => pickResult(r)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-t first:border-t-0 border-gray-100"
                >
                  <MapPin size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-snug">{r.label}</span>
                </button>
              ))}
              {!searching && results.length === 0 && query.length >= 2 && (
                <p className="px-4 py-3 text-sm text-gray-400">No results found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
