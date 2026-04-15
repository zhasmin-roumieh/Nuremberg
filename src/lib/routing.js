/**
 * Opens a multi-stop route in Google Maps
 * Origin = user location, waypoints = selected places, destination = last place
 */
export function openGoogleMaps(userLocation, places) {
  if (!places.length) return

  const origin = `${userLocation.lat},${userLocation.lng}`
  const destination = `${places[places.length - 1].lat},${places[places.length - 1].lng}`

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`

  if (places.length > 1) {
    const waypoints = places
      .slice(0, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|')
    url += `&waypoints=${encodeURIComponent(waypoints)}`
  }

  window.open(url, '_blank')
}

/**
 * Opens DB Navigator (Deutsche Bahn) to plan public transport
 * Uses nearest station name from user location (defaults to Nürnberg Hbf)
 */
export function openDBNavigator(userLocation, destination) {
  // Encode "My Location" as coordinates — DB web app accepts this
  const from = encodeURIComponent(`${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`)
  const to = encodeURIComponent(destination.name || 'Nürnberg')

  // DB Reiseauskunft deep link that works on both web and triggers the app on mobile
  const url = `https://reiseauskunft.bahn.de/bin/query.exe/dn?S=${from}&Z=${to}&start=1`
  window.open(url, '_blank')
}

/**
 * Builds a shareable Google Maps URL for a single place
 */
export function placeGoogleMapsUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
}
