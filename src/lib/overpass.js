// Overpass API — free OpenStreetMap data, no key needed
// Multiple endpoints so if one is slow/down, we try the next
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const BASE_QUERIES = {
  food: {
    cafe:       ['node["amenity"="cafe"]',       'way["amenity"="cafe"]'],
    restaurant: ['node["amenity"="restaurant"]', 'way["amenity"="restaurant"]'],
    bar:        ['node["amenity"="bar"]',         'way["amenity"="bar"]'],
    bakery:     ['node["shop"="bakery"]',         'way["shop"="bakery"]'],
    icecream:   ['node["amenity"="ice_cream"]',   'way["amenity"="ice_cream"]'],
    fastfood:   ['node["amenity"="fast_food"]',   'way["amenity"="fast_food"]'],
  },
  tourist: {
    museum:     ['node["tourism"="museum"]',     'way["tourism"="museum"]'],
    viewpoint:  ['node["tourism"="viewpoint"]'],
    attraction: ['node["tourism"="attraction"]', 'way["tourism"="attraction"]'],
    gallery:    ['node["tourism"="gallery"]',    'way["tourism"="gallery"]'],
    zoo:        ['node["tourism"="zoo"]',         'way["tourism"="zoo"]'],
    theme_park: ['node["tourism"="theme_park"]', 'way["tourism"="theme_park"]'],
  },
  history: {
    castle:   ['node["historic"="castle"]',   'way["historic"="castle"]',   'relation["historic"="castle"]'],
    church:   ['node["amenity"="place_of_worship"]["religion"="christian"]', 'way["amenity"="place_of_worship"]["religion"="christian"]'],
    monument: ['node["historic"="monument"]', 'way["historic"="monument"]'],
    memorial: ['node["historic"="memorial"]', 'way["historic"="memorial"]'],
    ruins:    ['node["historic"="ruins"]',    'way["historic"="ruins"]'],
    building: ['node["historic"="building"]', 'way["historic"="building"]'],
  },
  shopping: {
    market:     ['node["amenity"="marketplace"]',  'way["amenity"="marketplace"]'],
    mall:       ['node["shop"="mall"]',             'way["shop"="mall"]'],
    boutique:   ['node["shop"="clothes"]',          'way["shop"="clothes"]'],
    souvenir:   ['node["shop"="gift"]',             'way["shop"="gift"]'],
    books:      ['node["shop"="books"]',            'way["shop"="books"]'],
    department: ['node["shop"="department_store"]', 'way["shop"="department_store"]'],
  },
}

function applyTagFilters(tagLine, { cuisine }) {
  let t = tagLine
  if (cuisine && cuisine !== 'any') {
    // cuisine values can contain semicolons (e.g. "chinese;japanese") — turn into regex OR
    const pattern = cuisine.split(';').map(c => c.trim().replace(/[^a-z0-9_]/gi, '')).join('|')
    if (pattern) t += `["cuisine"~"${pattern}",i]`
  }
  return t
}

function buildQuery(category, subtype, lat, lng, radius, filters = {}) {
  const catMap = BASE_QUERIES[category] || {}
  let lines = subtype === 'all'
    ? Object.values(catMap).flat()
    : (catMap[subtype] || [])

  if (!lines.length) return null

  const area  = `(around:${radius},${lat},${lng})`
  const parts = lines.map(t => `  ${applyTagFilters(t, filters)}${area};`).join('\n')

  return `[out:json][timeout:25];\n(\n${parts}\n);\nout center tags;`
}

async function runQuery(query) {
  let lastErr
  for (const url of ENDPOINTS) {
    try {
      const ctrl    = new AbortController()
      const timer   = setTimeout(() => ctrl.abort(), 18000)
      const res     = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    `data=${encodeURIComponent(query)}`,
        signal:  ctrl.signal,
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

// Infer price tier from OSM tags + amenity type
// Returns: '€', '€€', '€€€' or null
function inferPrice(tags) {
  // 1. Explicit OSM price:range tag
  const pr = (tags['price:range'] || '').toLowerCase()
  if (pr === 'budget'   || pr === '1') return '€'
  if (pr === 'moderate' || pr === '2') return '€€'
  if (pr === 'expensive'|| pr === '3') return '€€€'
  if (pr === 'luxury'   || pr === '4') return '€€€'

  // 2. stars tag (some restaurants)
  const stars = parseInt(tags.stars, 10)
  if (stars >= 4) return '€€€'
  if (stars >= 2) return '€€'

  // 3. Infer from amenity/shop type — rough but better than nothing
  const type = tags.amenity || tags.shop || ''
  if (['fast_food', 'ice_cream'].includes(type)) return '€'
  if (type === 'bakery') return '€'
  if (type === 'cafe')   return '€€'
  if (type === 'bar')    return '€€'
  if (type === 'restaurant') return '€€'

  return null
}

// Map inferred € tier to filter bucket so budget filter actually works
function priceToBucket(priceRange) {
  if (!priceRange) return null
  if (priceRange === '€')   return '€'
  if (priceRange === '€€')  return '€€'
  if (priceRange === '€€€') return '€€€'
  return null
}

export async function fetchPlaces({ category, subtype = 'all', lat, lng, radius = 1000, cuisine = 'any' }) {
  const query = buildQuery(category, subtype, lat, lng, radius, { cuisine })
  if (!query) return []

  const data = await runQuery(query)

  return data.elements
    .map(el => {
      const elLat = el.lat ?? el.center?.lat
      const elLng = el.lon ?? el.center?.lon
      if (!elLat || !elLng) return null
      const tags    = el.tags || {}
      const inferred = inferPrice(tags)
      return {
        id:             String(el.id),
        lat:            elLat,
        lng:            elLng,
        name:           tags.name || tags['name:en'] || tags['name:de'] || 'Unnamed Place',
        category,
        subtype:        tags.amenity || tags.tourism || tags.historic || tags.shop || 'place',
        cuisine:        tags.cuisine,
        fee:            tags.fee,
        openingHours:   tags.opening_hours,
        website:        tags.website,
        phone:          tags.phone,
        description:    tags.description || tags['description:en'],
        address:        [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
        priceRange:     inferred,
        priceIsInferred: inferred !== null && !tags['price:range'],
        dietVegetarian: tags['diet:vegetarian'],
        dietVegan:      tags['diet:vegan'],
        dietHalal:      tags['diet:halal'],
        tags,
      }
    })
    .filter(Boolean)
}
