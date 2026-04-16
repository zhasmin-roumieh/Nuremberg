// Wikipedia Geosearch — completely free, no key, Wikipedia servers are rock-solid
// Returns nearby Wikipedia articles as tourist/history places with real descriptions + photos

const API = 'https://en.wikipedia.org/w/api.php'

// Keywords used to filter articles by subtype
const SUBTYPE_HINTS = {
  castle:   ['castle','fortress','burg','citadel','fortification','kaiserburg'],
  church:   ['church','cathedral','chapel','basilica','minster','dom','st.','saint'],
  monument: ['monument','column','statue','obelisk','denkmal'],
  memorial: ['memorial','gedenkstätte','remembrance','commemoration','holocaust'],
  ruins:    ['ruins','ruin','ruine','remains','remnant'],
  building: ['town hall','rathaus','palace','court','guildhall','opera'],
  museum:   ['museum','dokumentationszentrum','archive','collection'],
  gallery:  ['gallery','galerie','art museum','kunsthalle'],
  viewpoint:['tower','turm','observation','viewpoint','belfry','spire'],
  zoo:      ['zoo','aquarium','botanical','tierpark'],
  theme_park:['amusement','theme park','freizeitpark'],
}

function detectSubtype(title, extract) {
  const text = `${title} ${extract}`.toLowerCase()
  for (const [type, hints] of Object.entries(SUBTYPE_HINTS)) {
    if (hints.some(h => text.includes(h))) return type
  }
  return 'landmark'
}

function detectFee(extract = '') {
  const t = extract.toLowerCase()
  if (/free (admission|entry|entrance)|no (admission|entrance) fee/.test(t)) return 'no'
  if (/admission fee|entrance fee|ticket(s)? (required|cost)|paid/.test(t))  return 'yes'
  return null
}

export async function fetchWikiPlaces({ category, subtype = 'all', lat, lng, radius = 1000, keyword = '' }) {
  // Step 1 — geosearch: get article titles + coordinates near the point
  const geoRes = await fetch(API + '?' + new URLSearchParams({
    action:   'query',
    list:     'geosearch',
    gscoord:  `${lat}|${lng}`,
    gsradius: String(Math.min(radius, 10000)), // Wikipedia max is 10 000 m
    gslimit:  '50',
    format:   'json',
    origin:   '*',
  }))
  if (!geoRes.ok) throw new Error('Wikipedia API unavailable')
  const geoData  = await geoRes.json()
  const geoList  = geoData.query?.geosearch || []
  if (!geoList.length) return []

  // Step 2 — fetch extracts + thumbnails in one batch request
  const ids     = geoList.map(p => p.pageid).join('|')
  const detRes  = await fetch(API + '?' + new URLSearchParams({
    action:      'query',
    pageids:     ids,
    prop:        'coordinates|extracts|pageimages|info',
    exintro:     '1',
    exsentences: '3',
    explaintext: '1',
    pithumbsize: '600',
    inprop:      'url',
    format:      'json',
    origin:      '*',
  }))
  if (!detRes.ok) throw new Error('Wikipedia details failed')
  const detData = await detRes.json()
  const pages   = detData.query?.pages || {}

  // Step 3 — build normalised place objects
  let places = geoList.map(geo => {
    const page = pages[geo.pageid]
    if (!page || page.missing !== undefined) return null
    const coords  = page.coordinates?.[0]
    const extract = page.extract || ''
    return {
      id:          String(geo.pageid),
      name:        geo.title,
      lat:         coords?.lat ?? geo.lat,
      lng:         coords?.lon ?? geo.lon,
      category,
      subtype:     detectSubtype(geo.title, extract),
      description: extract || null,
      photo:       page.thumbnail?.source || null,
      website:     page.fullurl  || null,
      address:     null,
      rating:      null,
      priceRange:  null,
      openNow:     null,
      phone:       null,
      fee:         detectFee(extract),
      cuisine:     null,
      dietVegetarian: null,
      dietVegan:      null,
      dietHalal:      null,
    }
  }).filter(Boolean)

  // Filter by subtype keywords if a specific subtype is chosen
  if (subtype !== 'all' && SUBTYPE_HINTS[subtype]) {
    const hints = SUBTYPE_HINTS[subtype]
    places = places.filter(p => {
      const text = `${p.name} ${p.description || ''}`.toLowerCase()
      return hints.some(h => text.includes(h))
    })
    // If too strict (< 3 results), fall back to all
    if (places.length < 3) {
      places = geoList.map(geo => {
        const page = pages[geo.pageid]
        if (!page || page.missing !== undefined) return null
        const coords = page.coordinates?.[0]
        const extract = page.extract || ''
        return {
          id: String(geo.pageid), name: geo.title,
          lat: coords?.lat ?? geo.lat, lng: coords?.lon ?? geo.lon,
          category, subtype: detectSubtype(geo.title, extract),
          description: extract || null, photo: pages[geo.pageid]?.thumbnail?.source || null,
          website: pages[geo.pageid]?.fullurl || null, address: null, rating: null,
          priceRange: null, openNow: null, phone: null, fee: detectFee(extract),
          cuisine: null, dietVegetarian: null, dietVegan: null, dietHalal: null,
        }
      }).filter(Boolean)
    }
  }

  // Filter by keyword
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    places = places.filter(p =>
      `${p.name} ${p.description || ''}`.toLowerCase().includes(kw)
    )
  }

  return places
}
