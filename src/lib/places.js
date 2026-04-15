// Google Places API — uses the Maps JS SDK loaded by @react-google-maps/api
// window.google.maps is available after the API loads

// Maps each category+subtype to Google Places type + optional keyword
const TYPE_MAP = {
  food: {
    all:        [{ type: 'cafe' }, { type: 'restaurant' }, { type: 'bar' }, { type: 'bakery' }],
    cafe:       [{ type: 'cafe' }],
    restaurant: [{ type: 'restaurant' }],
    bar:        [{ type: 'bar' }],
    bakery:     [{ type: 'bakery' }],
    icecream:   [{ type: 'cafe', keyword: 'ice cream gelato eis' }],
    fastfood:   [{ type: 'meal_takeaway' }],
  },
  tourist: {
    all:        [{ type: 'tourist_attraction' }, { type: 'museum' }, { type: 'art_gallery' }],
    museum:     [{ type: 'museum' }],
    attraction: [{ type: 'tourist_attraction' }],
    viewpoint:  [{ type: 'tourist_attraction', keyword: 'viewpoint aussichtspunkt' }],
    gallery:    [{ type: 'art_gallery' }],
    zoo:        [{ type: 'zoo' }],
    theme_park: [{ type: 'amusement_park' }],
  },
  history: {
    all:      [
      { type: 'church' },
      { type: 'tourist_attraction', keyword: 'burg castle fortress' },
      { type: 'tourist_attraction', keyword: 'monument memorial denkmal' },
    ],
    castle:   [{ type: 'tourist_attraction', keyword: 'burg castle fortress' }],
    church:   [{ type: 'church' }],
    monument: [{ type: 'tourist_attraction', keyword: 'monument denkmal' }],
    memorial: [{ type: 'tourist_attraction', keyword: 'memorial gedenkstätte' }],
    ruins:    [{ type: 'tourist_attraction', keyword: 'ruins ruine' }],
    building: [{ type: 'tourist_attraction', keyword: 'historic building altstadt' }],
  },
  shopping: {
    all:        [{ type: 'shopping_mall' }, { type: 'clothing_store' }, { type: 'department_store' }],
    market:     [{ type: 'supermarket', keyword: 'market markt' }],
    mall:       [{ type: 'shopping_mall' }],
    boutique:   [{ type: 'clothing_store' }],
    souvenir:   [{ type: 'store', keyword: 'souvenir gift geschenk' }],
    books:      [{ type: 'book_store' }],
    department: [{ type: 'department_store' }],
  },
}

// Single nearbySearch call, returns a promise
function searchNearby({ type, keyword, lat, lng, radius }) {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    )
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius,
      type,
      ...(keyword ? { keyword } : {}),
    }
    service.nearbySearch(request, (results, status) => {
      const OK = window.google.maps.places.PlacesServiceStatus.OK
      const ZERO = window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
      if (status === OK)   return resolve(results || [])
      if (status === ZERO) return resolve([])
      reject(new Error(`Places API: ${status}`))
    })
  })
}

// Fetch all results for a category+subtype, deduped by place_id
export async function fetchPlaces({ category, subtype = 'all', lat, lng, radius = 1000 }) {
  const queries = TYPE_MAP[category]?.[subtype] ?? TYPE_MAP[category]?.all ?? []

  const settled = await Promise.allSettled(
    queries.map(q => searchNearby({ ...q, lat, lng, radius }))
  )

  const seen = new Set()
  const places = []

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    for (const p of result.value) {
      if (seen.has(p.place_id)) continue
      seen.add(p.place_id)
      places.push(normalise(p, category))
    }
  }

  return places
}

// Map Google Place object → our internal shape
function normalise(p, category) {
  const loc = p.geometry?.location
  return {
    id:           p.place_id,
    name:         p.name,
    lat:          typeof loc?.lat === 'function' ? loc.lat() : loc?.lat,
    lng:          typeof loc?.lng === 'function' ? loc.lng() : loc?.lng,
    category,
    subtype:      (p.types?.[0] ?? 'place').replace(/_/g, ' '),
    address:      p.vicinity,
    priceLevel:   p.price_level,       // 0=free 1=€ 2=€€ 3=€€€ 4=€€€€
    rating:       p.rating,
    ratingsTotal: p.user_ratings_total,
    openNow:      p.opening_hours?.open_now,
    photo:        p.photos?.[0]?.getUrl({ maxWidth: 400 }),
    icon:         p.icon,
    fee:          p.price_level === 0 ? 'no' : p.price_level > 0 ? 'yes' : undefined,
    priceRange:   priceLevelToSymbol(p.price_level),
  }
}

function priceLevelToSymbol(level) {
  return ['Free', '€', '€€', '€€€', '€€€€'][level] ?? null
}
