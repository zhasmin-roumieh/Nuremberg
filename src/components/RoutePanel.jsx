import { X, Trash2, Navigation, Train, Map, ArrowDown } from 'lucide-react'
import { openGoogleMaps, openDBNavigator } from '../lib/routing'

const CAT_EMOJI = { food:'🍽️', tourist:'🏛️', history:'⚔️', shopping:'🛍️' }

export default function RoutePanel({ places, userLocation, onClose, onRemove, onReorder }) {
  if (!places.length) return null

  const move = (idx, dir) => {
    const next = [...places]
    const to = idx + dir
    if (to < 0 || to >= next.length) return
    ;[next[idx], next[to]] = [next[to], next[idx]]
    onReorder(next)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col
        shadow-[0_-4px_32px_rgba(0,0,0,0.18)] animate-[slideUp_0.3s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Your Route</h2>
            <p className="text-xs text-gray-400 mt-0.5">{places.length} stop{places.length !== 1 ? 's' : ''} · tap ▲▼ to reorder</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X size={15} />
          </button>
        </div>

        {/* Stops */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-2">
          {/* Start */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <Navigation size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Your Location</p>
              <p className="text-xs text-blue-400">Starting point</p>
            </div>
          </div>

          {places.map((place, idx) => (
            <div key={place.id}>
              <div className="flex justify-center py-0.5">
                <ArrowDown size={13} className="text-gray-300" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{CAT_EMOJI[place.category]} {place.subtype?.replace(/_/g,' ')}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => move(idx,-1)} disabled={idx===0}
                    className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 hover:text-gray-700 disabled:opacity-25">▲</button>
                  <button onClick={() => move(idx,1)} disabled={idx===places.length-1}
                    className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 hover:text-gray-700 disabled:opacity-25">▼</button>
                  <button onClick={() => onRemove(place)}
                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="px-5 pt-3 pb-6 border-t border-gray-100 space-y-2.5 flex-shrink-0">
          <button onClick={() => openGoogleMaps(userLocation, places)}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
              bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold transition-colors text-sm">
            <Map size={18} /> Open in Google Maps
          </button>
          <button onClick={() => openDBNavigator(userLocation, places[places.length - 1])}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
              bg-[#EC0016] hover:bg-[#cc0012] text-white font-semibold transition-colors text-sm">
            <Train size={18} /> Open in DB Navigator
          </button>
          <p className="text-[11px] text-gray-400 text-center px-4">
            DB Navigator opens public transport to your last stop
          </p>
        </div>
      </div>
    </div>
  )
}
