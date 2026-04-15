import { X, GripVertical, Trash2, Navigation, Train, Map, ArrowRight } from 'lucide-react'
import { openGoogleMaps, openDBNavigator } from '../lib/routing'
import { useState } from 'react'

const CAT_EMOJI = {
  food:     '🍽️',
  tourist:  '🏛️',
  history:  '⚔️',
  shopping: '🛍️',
}

export default function RoutePanel({ places, userLocation, onClose, onRemove, onReorder }) {
  const [dragIdx, setDragIdx] = useState(null)

  if (!places.length) return null

  const handleGoogleMaps = () => openGoogleMaps(userLocation, places)

  const handleDB = () => {
    // Open DB for the final destination
    openDBNavigator(userLocation, places[places.length - 1])
  }

  // Simple move up/down reorder
  const move = (idx, dir) => {
    const next = [...places]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onReorder(next)
  }

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Your Route</h2>
            <p className="text-xs text-gray-500">{places.length} stop{places.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stops list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {/* Start = user location */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Navigation size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Your Location</p>
              <p className="text-xs text-blue-500">Starting point</p>
            </div>
          </div>

          {places.map((place, idx) => (
            <div key={place.id}>
              {/* Connector arrow */}
              <div className="flex justify-center my-1">
                <ArrowRight size={14} className="text-gray-300" />
              </div>

              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                {/* Stop number */}
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 text-xs font-bold">{idx + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-400">{CAT_EMOJI[place.category]} {place.subtype}</p>
                </div>

                {/* Move & remove */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === places.length - 1}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    title="Move down"
                  >▼</button>
                  <button
                    onClick={() => onRemove(place)}
                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-500 text-center mb-3">Open your route in an app</p>

          <button
            onClick={handleGoogleMaps}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
              bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold transition-colors"
          >
            <Map size={20} />
            Open in Google Maps
            <span className="text-xs opacity-80">(walk / drive)</span>
          </button>

          <button
            onClick={handleDB}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
              bg-[#EC0016] hover:bg-[#cc0012] text-white font-semibold transition-colors"
          >
            <Train size={20} />
            Open in DB Navigator
            <span className="text-xs opacity-80">(public transport)</span>
          </button>

          <p className="text-[11px] text-gray-400 text-center px-2 pt-1">
            DB Navigator opens to the last stop in your route. Install the DB Navigator app for the best experience.
          </p>
        </div>
      </div>
    </div>
  )
}
