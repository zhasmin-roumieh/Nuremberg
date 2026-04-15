// Overpass API — free OpenStreetMap data, no key needed
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Base tag lines per category → subtype
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
    market:     ['node["amenity"="marketplace"]',     'way["amenity"="marketplace"]'],
    mall:       ['node["shop"="mall"]',                'way["shop"="mall"]'],
    boutique:   ['node["shop"="clothes"]',             'way["shop"="clothes"]'],
    souvenir:   ['node["shop"="gift"]',                'way["shop"="gift"]'],
    books:      ['node["shop"="books"]',               'way["shop"="books"]'],
    department: ['node["shop"="department_store"]',    'way["shop"="department_store"]'],
  },
}

// Append extra OSM tag filters to a tag line, e.g.:
//   node["amenity"="restaurant"]  →  node["amenity"="restaurant"]["cuisine"~"italian",i]
function applyTagFilters(tagLine, { cuisine }) {
  let t = tagLine
  if (cuisine && cuisine !== 'any') {
    // OSM cuisine values can be semicolon-separated, so use regex match
    const safe = cuisine.replace(/[^a-z0-9_]/gi, '')
    t += `["cuisine"~"${safe}",i]`
  }
  return t
}

function buildOverpassQuery(category, subtype, lat, lng, radius, filters = {}) {
  const catQueries = BASE_QUERIES[category] || {}
  let baseLines = []

  if (subtype === 'all') {
    Object.values(catQueries).forEach(arr => baseLines.push(...arr))
  } else {
    baseLines = catQueries[subtype] || []
  }

  const area  = `(around:${radius},${lat},${lng})`
  const parts = baseLines
    .map(t => `  ${applyTagFilters(t, filters)}${area};`)
    .join('\n')

  return `[out:json][timeout:30];
(
${parts}
);
out center tags;`
}

export async function fetchPlaces({
  category,
  subtype  = 'all',
  lat,
  lng,
  radius   = 1000,
  cuisine  = 'any',
}) {
  const query = buildOverpassQuery(category, subtype, lat, lng, radius, { cuisine })

  const res = await fetch(OVERPASS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `data=${encodeURIComponent(query)}`,
  })

  if (!res.ok) throw new Error('Overpass request failed')
  const data = await res.json()

  return data.elements
    .map(el => {
      const lat = el.lat ?? el.center?.lat
      const lng = el.lon ?? el.center?.lon
      if (!lat || !lng) return null

      const tags = el.tags || {}
      return {
        id:           String(el.id),
        lat,
        lng,
        name:         tags.name || tags['name:en'] || tags['name:de'] || 'Unnamed Place',
        category,
        subtype:      getSubtype(tags),
        cuisine:      tags.cuisine,
        fee:          tags.fee,
        openingHours: tags.opening_hours,
        website:      tags.website,
        phone:        tags.phone,
        description:  tags.description || tags['description:en'],
        address:      buildAddress(tags),
        priceRange:   tags.price_range || estimatePriceRange(tags),
        // dietary tags
        dietVegetarian: tags['diet:vegetarian'],
        dietVegan:      tags['diet:vegan'],
        dietHalal:      tags['diet:halal'],
        tags,
      }
    })
    .filter(Boolean)
}

function getSubtype(tags) {
  return tags.amenity || tags.tourism || tags.historic || tags.shop || 'place'
}

function buildAddress(tags) {
  const parts = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean)
  return parts.length ? parts.join(' ') : null
}

function estimatePriceRange(tags) {
  if (tags['price:range']) return tags['price:range']
  if (tags.stars) {
    const s = parseInt(tags.stars)
    if (s >= 4) return '€€€'
    if (s >= 2) return '€€'
    return '€'
  }
  return null
}
