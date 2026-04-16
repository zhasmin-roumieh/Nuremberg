import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import FilterPanel from './components/FilterPanel'
import PlacesList from './components/PlacesList'
import RoutePanel from './components/RoutePanel'
import TopBar from './components/TopBar'
import { fetchPlaces } from './lib/places'

const NUREMBERG_CENTER = { lat: 49.4521, lng: 11.0767 }

export default function App() {
  const [userLocation, setUserLocation]     = useState(null)
  const [locating, setLocating]             = useState(false)
  const [places, setPlaces]                 = useState([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [activePlace, setActivePlace]       = useState(null)
  const [showRoute, setShowRoute]           = useState(false)
  const [panelView, setPanelView]           = useState('filter')
  const [expanded, setExpanded]             = useState(false)

  const [filters, setFilters] = useState({
    category: 'tourist',
    subtype:  'all',
    distance: 1000,
    budget:   'any',
    entry:    'any',
    cuisine:  'any',
    dietary:  'any',
    keyword:  '',
  })

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      ()  => { setError('Could not get your location. Allow location access or type it manually.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const searchPlaces = useCallback(async (overrideFilters) => {
    const f   = overrideFilters || filters
    const loc = userLocation || NUREMBERG_CENTER
    setLoading(true); setError(null); setPlaces([]); setPanelView('list'); setExpanded(true)

    try {
      let results = await fetchPlaces({
        category: f.category, subtype: f.subtype,
        lat: loc.lat, lng: loc.lng,
        radius: f.distance,
        cuisine: f.cuisine,
        keyword: f.keyword,
      })

      // Entry — only include places with an explicit fee tag to avoid false positives
      if (f.entry !== 'any') {
        results = results.filter(p =>
          f.entry === 'free' ? p.fee === 'no' : p.fee === 'yes'
        )
      }

      // Dietary
      if (f.dietary !== 'any') {
        results = results.filter(p => {
          const yes = ['yes', 'only']
          if (f.dietary === 'vegetarian') return yes.includes(p.dietVegetarian)
          if (f.dietary === 'vegan')      return yes.includes(p.dietVegan)
          if (f.dietary === 'halal')      return yes.includes(p.dietHalal)
          return true
        })
      }

      // Budget — now works because overpass always infers a tier
      if (f.budget !== 'any' && f.category === 'food') {
        results = results.filter(p => !p.priceRange || p.priceRange === f.budget)
      }

      setPlaces(results)
    } catch {
      setError('Could not load places. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }, [filters, userLocation])

  const togglePlaceInRoute = useCallback(place =>
    setSelectedPlaces(prev =>
      prev.some(p => p.id === place.id) ? prev.filter(p => p.id !== place.id) : [...prev, place]
    ), [])

  const isInRoute = useCallback(place => selectedPlaces.some(p => p.id === place.id), [selectedPlaces])

  // Sheet height: collapsed shows ~2 rows of content, expanded shows most of screen
  const sheetH = expanded ? 'h-[78vh]' : 'h-[44vh]'

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <TopBar locating={locating} onLocate={locateUser} userLocation={userLocation}
        routeCount={selectedPlaces.length} onShowRoute={() => setShowRoute(true)}
        onSetLocation={setUserLocation} />

      <div className="flex-1 relative">
        {/* Map isolated stacking context */}
        <div className="absolute inset-0 z-0">
          <MapView center={userLocation || NUREMBERG_CENTER} userLocation={userLocation}
            places={places} selectedPlaces={selectedPlaces} activePlace={activePlace}
            onPlaceClick={place => { setActivePlace(place); setPanelView('list') }}
            isInRoute={isInRoute} />
        </div>

        {/* Bottom sheet */}
        <div className={`absolute bottom-0 left-0 right-0 ${sheetH} z-10 flex flex-col
          bg-white rounded-t-3xl shadow-[0_-4px_32px_rgba(0,0,0,0.12)] transition-all duration-300`}>

          {/* Handle */}
          <button className="w-full pt-3 pb-2 flex justify-center flex-shrink-0"
            onClick={() => setExpanded(e => !e)}>
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </button>

          {/* Tabs */}
          <div className="flex px-4 gap-1 flex-shrink-0 pb-1">
            <TabBtn active={panelView === 'filter'} onClick={() => setPanelView('filter')}>Search</TabBtn>
            <TabBtn active={panelView === 'list'}   onClick={() => setPanelView('list')}>
              Results
              {places.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {places.length}
                </span>
              )}
            </TabBtn>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {panelView === 'filter'
              ? <FilterPanel filters={filters} setFilters={setFilters} onSearch={searchPlaces} loading={loading} />
              : <PlacesList places={places} loading={loading} error={error}
                  activePlace={activePlace} setActivePlace={setActivePlace}
                  isInRoute={isInRoute} togglePlaceInRoute={togglePlaceInRoute}
                  userLocation={userLocation} onRetry={searchPlaces} />
            }
          </div>
        </div>
      </div>

      {showRoute && (
        <RoutePanel places={selectedPlaces} userLocation={userLocation || NUREMBERG_CENTER}
          onClose={() => setShowRoute(false)} onRemove={togglePlaceInRoute}
          onReorder={setSelectedPlaces} />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all
        ${active ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
      {children}
    </button>
  )
}
