// Nominatim — free OpenStreetMap geocoder, no API key needed
// Biased toward Germany, with a soft focus on the Nuremberg area
export async function geocode(query) {
  if (!query || query.trim().length < 2) return []

  const params = new URLSearchParams({
    q:           query,
    format:      'json',
    limit:       '5',
    countrycodes:'de',
    addressdetails: '1',
  })

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { 'Accept-Language': 'en' } }
  )
  if (!res.ok) throw new Error('Geocoding failed')

  const data = await res.json()
  return data.map(r => ({
    label: formatLabel(r),
    lat:   parseFloat(r.lat),
    lng:   parseFloat(r.lon),
  }))
}

function formatLabel(r) {
  const a = r.address || {}
  const parts = [
    a.road || a.pedestrian || a.footway,
    a.house_number,
    a.suburb || a.neighbourhood,
    a.city || a.town || a.village || a.municipality,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : r.display_name.split(',').slice(0, 3).join(',')
}
