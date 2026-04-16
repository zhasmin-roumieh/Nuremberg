// Smart router: Wikipedia for tourist/history (rich data), Overpass for food/shopping (great POI data)
import { fetchWikiPlaces }     from './wikipedia'
import { fetchPlaces as fetchOverpassPlaces } from './overpass'

export async function fetchPlaces(params) {
  if (params.category === 'tourist' || params.category === 'history') {
    return fetchWikiPlaces(params)
  }
  return fetchOverpassPlaces(params)
}
