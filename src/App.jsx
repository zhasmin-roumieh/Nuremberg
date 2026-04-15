import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import FilterPanel from './components/FilterPanel'
import PlacesList from './components/PlacesList'
import RoutePanel from './components/RoutePanel'
import TopBar from './components/TopBar'
import TokenGate from './components/TokenGate'
import { fetchPlaces } from './lib/places'

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Nuremberg city center fallback
const NUREMBERG_CENTER = { lat: 49.4521, lng: 11.0767 }

export default function App() {
  const [googleReady, setGoogleReady]       = useState(false)
  const [userLocation, setUserLocation]     = useState(null)
  const [locating, setLocating]             = useState(false)
  const [places, setPlaces]                 = useState([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [activePlace, setActivePlace]       = useState(null)
  const [showRoute, setShowRoute]           = useState(false)
  const [panelView, setPanelView]           = useState('filter')

  const [filters, setFilters] = useState({
    category: 'tourist',
    subtype:  'all',
    distance: 1000,
    budget:   'any',
    entry:    'any',
  })

  // ── Get user location ──────────────────────────────────────────
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Please allow location access.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // ── Search places ──────────────────────────────────────────────
  const searchPlaces = useCallback(async (overrideFilters) => {
    if (!googleReady) return
    const f   = overrideFilters || filters
    const loc = userLocation || NUREMBERG_CENTER

    setLoading(true)
    setError(null)
    setPlaces([])
    setPanelView('list')

    try {
      let results = await fetchPlaces({
        category: f.category,
        subtype:  f.subtype,
        lat:      loc.lat,
        lng:      loc.lng,
        radius:   f.distance,
      })

      // Filter by entry type (uses Google's priceLevel: 0 = free)
      if (f.entry !== 'any') {
        results = results.filter(p => {
          if (f.entry === 'free') return p.fee === 'no' || p.priceLevel === 0
          if (f.entry === 'paid') return p.fee === 'yes' || (p.priceLevel != null && p.priceLevel > 0)
          return true
        })
      }

      // Filter by budget (uses Google's priceLevel 1-4)
      if (f.budget !== 'any' && f.category === 'food') {
        results = results.filter(p => {
          if (p.priceLevel == null) return true // keep if unknown
          if (f.budget === '€')   return p.priceLevel <= 1
          if (f.budget === '€€')  return p.priceLevel === 2
          if (f.budget === '€€€') return p.priceLevel >= 3
          return true
        })
      }

      setPlaces(results)
    } catch (e) {
      setError('Could not load places. Check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [filters, userLocation, googleReady])

  // ── Route helpers ──────────────────────────────────────────────
  const togglePlaceInRoute = useCallback((place) => {
    setSelectedPlaces(prev =>
      prev.some(p => p.id === place.id)
        ? prev.filter(p => p.id !== place.id)
        : [...prev, place]
    )
  }, [])

  const isInRoute = useCallback(
    (place) => selectedPlaces.some(p => p.id === place.id),
    [selectedPlaces]
  )

  if (!GOOGLE_KEY) return <TokenGate />

  return (
    <div className="relative h-full w-full flex flex-col bg-gray-50">
      <TopBar
        locating={locating}
        onLocate={locateUser}
        userLocation={userLocation}
        routeCount={selectedPlaces.length}
        onShowRoute={() => setShowRoute(true)}
      />

      <div className="flex-1 relative">
        <MapView
          apiKey={GOOGLE_KEY}
          center={userLocation || NUREMBERG_CENTER}
          userLocation={userLocation}
          places={places}
          selectedPlaces={selectedPlaces}
          activePlace={activePlace}
          onPlaceClick={place => {
            setActivePlace(place)
            setPanelView('list')
          }}
          isInRoute={isInRoute}
          onApiReady={() => setGoogleReady(true)}
        />

        <BottomSheet
          panelView={panelView}
          setPanelView={setPanelView}
          filters={filters}
          setFilters={setFilters}
          onSearch={searchPlaces}
          places={places}
          loading={loading}
          error={error}
          activePlace={activePlace}
          setActivePlace={setActivePlace}
          isInRoute={isInRoute}
          togglePlaceInRoute={togglePlaceInRoute}
          userLocation={userLocation}
          searchDisabled={!googleReady}
        />
      </div>

      {showRoute && (
        <RoutePanel
          places={selectedPlaces}
          userLocation={userLocation || NUREMBERG_CENTER}
          onClose={() => setShowRoute(false)}
          onRemove={togglePlaceInRoute}
          onReorder={setSelectedPlaces}
        />
      )}
    </div>
  )
}

// ── Bottom sheet ────────────────────────────────────────────────────
function BottomSheet({
  panelView, setPanelView,
  filters, setFilters, onSearch,
  places, loading, error,
  activePlace, setActivePlace,
  isInRoute, togglePlaceInRoute,
  userLocation, searchDisabled,
}) {
  const [expanded, setExpanded] = useState(false)
  const sheetHeight = expanded ? 'h-[75vh]' : 'h-[42vh]'

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 ${sheetHeight} bg-white rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col`}
    >
      <button
        className="w-full pt-3 pb-1 flex justify-center"
        onClick={() => setExpanded(e => !e)}
        aria-label="Toggle panel"
      >
        <div className="drag-handle" />
      </button>

      <div className="flex border-b border-gray-100 px-4">
        <TabBtn active={panelView === 'filter'} onClick={() => setPanelView('filter')}>
          Search
        </TabBtn>
        <TabBtn active={panelView === 'list'} onClick={() => setPanelView('list')}>
          Results{places.length > 0 && (
            <span className="ml-1 text-xs bg-primary-500 text-white rounded-full px-1.5">
              {places.length}
            </span>
          )}
        </TabBtn>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {panelView === 'filter' ? (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onSearch={onSearch}
            loading={loading}
            disabled={searchDisabled}
          />
        ) : (
          <PlacesList
            places={places}
            loading={loading}
            error={error}
            activePlace={activePlace}
            setActivePlace={setActivePlace}
            isInRoute={isInRoute}
            togglePlaceInRoute={togglePlaceInRoute}
            userLocation={userLocation}
          />
        )}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors
        ${active
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
    >
      {children}
    </button>
  )
}
