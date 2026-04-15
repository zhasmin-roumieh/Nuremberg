import { MapPin, Navigation, Map, Route } from 'lucide-react'

export default function TopBar({ locating, onLocate, userLocation, routeCount, onShowRoute }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10">
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
            My Route
            <span className="bg-white text-primary-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {routeCount}
            </span>
          </button>
        )}

        {/* Locate button */}
        <button
          onClick={onLocate}
          disabled={locating}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors
            ${userLocation
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-60`}
        >
          {locating ? (
            <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation size={15} className={userLocation ? 'text-blue-500' : ''} />
          )}
          {locating ? 'Locating…' : userLocation ? 'Located' : 'Locate Me'}
        </button>
      </div>
    </div>
  )
}
