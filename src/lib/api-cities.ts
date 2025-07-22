// API-based city search using server-side proxy
// Scalable, live, and always up-to-date

export interface ApiCity {
  name: string
  country: string
  countryCode: string
  region: string
  subregion?: string
  latitude?: number
  longitude?: number
  population?: number
  airports: string[]
  mainAirport?: string
}

// Client-side cache to avoid repeated requests
const cityCache = new Map<string, ApiCity[]>()
const cacheExpiry = new Map<string, number>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Use our server-side API proxy to avoid CORS issues
export async function searchCitiesAPI(query: string, limit = 10): Promise<ApiCity[]> {
  if (!query || query.length < 2) return []

  const cacheKey = `${query.toLowerCase()}-${limit}`
  const now = Date.now()

  // Check cache first
  if (cityCache.has(cacheKey) && cacheExpiry.get(cacheKey)! > now) {
    return cityCache.get(cacheKey)!
  }

  try {
    // Call our server-side API proxy
    const response = await fetch(`/api/cities/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const cities = data.cities || []

    // Cache the results
    cityCache.set(cacheKey, cities)
    cacheExpiry.set(cacheKey, now + CACHE_DURATION)

    return cities
  } catch (error) {
    console.error('City search API error:', error)
    // Return empty array - component will fall back to static data
    return []
  }
}

// All API logic moved to server-side /api/cities/search route
// This file now only handles client-server communication