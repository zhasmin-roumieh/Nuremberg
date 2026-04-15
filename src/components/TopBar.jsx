import { useState, useRef, useEffect, useCallback } from 'react'
import { Navigation, Search, X, MapPin, Route } from 'lucide-react'
import { geocode } from '../lib/geocode'

export default function TopBar({ locating, onLocate, userLocation, routeCount, onShowRoute, onSetLocation }) {
  const [showSearch,   setShowSearch]   = useState(false)
  const [query,        setQuery]        = useState('')
  const [results,      setResults]      = useState([])
  const [searching,    setSearching]    = useState(false)
  const [manualLabel,  setManualLabel]  = useState(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { if (showSearch) inputRef.current?.focus() }, [showSearch])

  const handleInput = useCallback(e => {
    const val = e.target.value
    setQuery(val)
    setResults([])
    clearTimeout(timerRef.current)
    if (val.trim().length < 2) return
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try { setResults(await geocode(val)) } catch {}
      finally { setSearching(false) }
    }, 380)
  }, [])

  const pick = useCallback(r => {
    onSetLocation({ lat: r.lat, lng: r.lng })
    setManualLabel(r.label)
    setQuery(''); setResults([]); setShowSearch(false)
  }, [onSetLocation])

  const clearManual = () => { setManualLabel(null); onLocate() }
  const closeSearch = () => { setShowSearch(false); setQuery(''); setResults([]) }

  const locActive = userLocation && !manualLabel

  return (
    <div className="bg-white border-b border-gray-100 z-10">
      {/* ── Main row ── */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-base">🗺️</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">Nuremberg Explorer</p>
            {manualLabel
              ? <p className="text-[11px] text-primary-500 leading-tight truncate">{manualLabel}</p>
              : <p className="text-[11px] text-gray-400 leading-tight">{locActive ? 'Using GPS location' : 'Set your location'}</p>
            }
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Route */}
          {routeCount > 0 && (
            <button onClick={onShowRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-sm">
              <Route size={13} />
              Route
              <span className="bg-white text-primary-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {routeCount}
              </span>
            </button>
          )}

          {/* GPS */}
          <button onClick={onLocate} disabled={locating} title="Use GPS"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${locActive ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
              disabled:opacity-50`}>
            {locating
              ? <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              : <Navigation size={15} />}
          </button>

          {/* Manual location */}
          <button onClick={() => showSearch ? closeSearch() : setShowSearch(true)} title="Type location"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${showSearch || manualLabel ? 'bg-primary-50 text-primary-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <MapPin size={15} />
          </button>
        </div>
      </div>

      {/* ── Manual location search ── */}
      {showSearch && (
        <div className="px-4 pb-3 space-y-1.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={inputRef} type="text" value={query} onChange={handleInput}
              placeholder="Search address or place…"
              className="w-full pl-8 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:bg-white transition-all" />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>
            )}
          </div>
          {(results.length > 0 || searching) && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {searching && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                  <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-primary-400 rounded-full animate-spin" />
                  Searching…
                </div>
              )}
              {results.map((r, i) => (
                <button key={i} onClick={() => pick(r)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-t first:border-t-0 border-gray-100">
                  <MapPin size={13} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-snug">{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual label clear bar */}
      {manualLabel && !showSearch && (
        <div className="flex items-center gap-2 px-4 pb-2.5">
          <MapPin size={12} className="text-primary-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 flex-1 truncate">{manualLabel}</p>
          <button onClick={clearManual} className="text-gray-400 hover:text-gray-600 p-0.5"><X size={12} /></button>
        </div>
      )}
    </div>
  )
}
