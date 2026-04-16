// Foursquare Places API v3 — 100,000 free calls/month, no credit card needed
// Docs: https://docs.foursquare.com/developer/reference/place-search

const BASE = 'https://api.foursquare.com/v3/places/search'

// Foursquare top-level category IDs (broad buckets)
const CAT_IDS = {
  food:     '13000',           // Dining & Drinking
  tourist:  '10000,16000',     // Arts & Entertainment + Landmarks
  history:  '16000,12000',     // Landmarks + Community (churches etc.)
  shopping: '17000',           // Retail
}

// Human-readable search terms per subtype — used as the query string
const SUBTYPE_QUERY = {
  food: {
    all:        '',
    cafe:       'cafe coffee',
    restaurant: 'restaurant',
    bar:        'bar pub',
    bakery:     'bakery',
    icecream:   'ice cream gelato',
    fastfood:   'fast food',
  },
  tourist: {
    all:        '',
    museum:     'museum',
    attraction: 'attraction',
    viewpoint:  'viewpoint observation tower',
    gallery:    'art gallery',
    zoo:        'zoo',
    theme_park: 'amusement theme park',
  },
  history: {
    all:        '',
    castle:     'castle fortress burg',
    church:     'church cathedral',
    monument:   'monument',
    memorial:   'memorial',
    ruins:      'ruins',
    building:   'historic building',
  },
  shopping: {
    all:        '',
    market:     'market',
    mall:       'shopping mall',
    boutique:   'clothes fashion boutique',
    souvenir:   'souvenir gift shop',
    books:      'bookstore',
    department: 'department store',
  },
}

export async function fetchPlaces({
  category, subtype = 'all',
  lat, lng, radius = 1000,
  cuisine = 'any', keyword = '',
  apiKey,
}) {
  // Build search query: cuisine + keyword + subtype terms
  const parts = [
    cuisine !== 'any' ? cuisine : '',
    keyword.trim(),
    SUBTYPE_QUERY[category]?.[subtype] ?? '',
  ].filter(Boolean)

  const params = new URLSearchParams({
    ll:         `${lat},${lng}`,
    radius:     String(radius),
    categories: CAT_IDS[category] || '16000',
    limit:      '50',
    fields:     'fsq_id,name,geocodes,location,categories,hours,price,rating,photos,tel,website,description',
  })
  if (parts.length) params.set('query', parts.join(' '))

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: apiKey, Accept: 'application/json' },
  })

  if (res.status === 401) throw new Error('Invalid Foursquare API key. Check your .env file.')
  if (res.status === 429) throw new Error('Too many requests — Foursquare rate limit reached. Try again in a minute.')
  if (!res.ok)            throw new Error(`Foursquare error ${res.status}`)

  const data = await res.json()
  return (data.results || []).map(p => normalise(p, category)).filter(Boolean)
}

function normalise(p, category) {
  const geo = p.geocodes?.main
  if (!geo?.latitude || !geo?.longitude) return null

  const firstCat = p.categories?.[0]

  return {
    id:          p.fsq_id,
    name:        p.name,
    lat:         geo.latitude,
    lng:         geo.longitude,
    category,
    subtype:     firstCat?.name?.toLowerCase().replace(/\s+/g, '_') || 'place',
    address:     p.location?.formatted_address || p.location?.address || null,
    rating:      p.rating != null ? +(p.rating / 2).toFixed(1) : null,  // FSQ 0–10 → 0–5
    priceRange:  p.price ? '€'.repeat(p.price) : null,
    openNow:     p.hours?.open_now ?? null,
    website:     p.website   || null,
    phone:       p.tel       || null,
    description: p.description || null,
    photo:       p.photos?.[0]
                   ? `${p.photos[0].prefix}300x200${p.photos[0].suffix}`
                   : null,
    // OSM-specific fields kept as null so PlacesList doesn't break
    fee: null, cuisine: null,
    dietVegetarian: null, dietVegan: null, dietHalal: null,
  }
}
