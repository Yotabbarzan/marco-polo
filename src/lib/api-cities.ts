// API-based city search using REST Countries and GeoNames APIs
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

// Cache to avoid repeated API calls
const cityCache = new Map<string, ApiCity[]>()
const cacheExpiry = new Map<string, number>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// REST Countries API - Free comprehensive city data
export async function searchCitiesAPI(query: string, limit = 10): Promise<ApiCity[]> {
  if (!query || query.length < 2) return []

  const cacheKey = query.toLowerCase()
  const now = Date.now()

  // Check cache first
  if (cityCache.has(cacheKey) && cacheExpiry.get(cacheKey)! > now) {
    return cityCache.get(cacheKey)!.slice(0, limit)
  }

  try {
    // Use multiple APIs for comprehensive coverage
    const [countriesData, geoNamesData] = await Promise.allSettled([
      searchRestCountries(query),
      searchGeoNames(query, limit)
    ])

    let cities: ApiCity[] = []

    // Process REST Countries results
    if (countriesData.status === 'fulfilled') {
      cities = [...cities, ...countriesData.value]
    }

    // Process GeoNames results
    if (geoNamesData.status === 'fulfilled') {
      cities = [...cities, ...geoNamesData.value]
    }

    // Remove duplicates and sort by relevance
    const uniqueCities = removeDuplicateCities(cities)
    const sortedCities = sortCitiesByRelevance(uniqueCities, query)

    // Cache the results
    cityCache.set(cacheKey, sortedCities)
    cacheExpiry.set(cacheKey, now + CACHE_DURATION)

    return sortedCities.slice(0, limit)
  } catch (error) {
    console.error('City search API error:', error)
    // Fallback to static data if API fails
    return []
  }
}

// REST Countries API search
async function searchRestCountries(query: string): Promise<ApiCity[]> {
  const response = await fetch(
    `https://countriesnow.space/api/v0.1/countries/cities`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: '' }) // Get all cities
    }
  )

  if (!response.ok) throw new Error('REST Countries API failed')

  const data = await response.json()
  const cities: ApiCity[] = []

  // Filter cities that match the query
  data.data?.forEach((country: { country: string; cities: string[] }) => {
    const matchingCities = country.cities?.filter((city: string) =>
      city.toLowerCase().includes(query.toLowerCase())
    ) || []

    matchingCities.forEach((cityName: string) => {
      cities.push({
        name: cityName,
        country: country.country,
        countryCode: getCountryCode(country.country),
        region: getRegionFromCountry(country.country),
        airports: getAirportsForCity(cityName, country.country),
        mainAirport: getMainAirport(cityName, country.country)
      })
    })
  })

  return cities
}

// GeoNames API search (requires free registration)
async function searchGeoNames(query: string, limit: number): Promise<ApiCity[]> {
  // You'll need to register at http://www.geonames.org/login
  const username = process.env.GEONAMES_USERNAME || 'demo'
  
  const response = await fetch(
    `http://api.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=${limit}&username=${username}&featureClass=P&orderby=population`
  )

  if (!response.ok) throw new Error('GeoNames API failed')

  const data = await response.json()
  
  return data.geonames?.map((place: {
    name: string;
    countryName: string;
    countryCode: string;
    adminName1: string;
    lat: string;
    lng: string;
    population: number;
  }) => ({
    name: place.name,
    country: place.countryName,
    countryCode: place.countryCode,
    region: place.adminName1,
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lng),
    population: place.population,
    airports: getAirportsForCity(place.name, place.countryName),
    mainAirport: getMainAirport(place.name, place.countryName)
  })) || []
}

// Remove duplicate cities
function removeDuplicateCities(cities: ApiCity[]): ApiCity[] {
  const seen = new Set<string>()
  return cities.filter(city => {
    const key = `${city.name.toLowerCase()}-${city.countryCode}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Sort cities by relevance to search query
function sortCitiesByRelevance(cities: ApiCity[], query: string): ApiCity[] {
  return cities.sort((a, b) => {
    const queryLower = query.toLowerCase()
    
    // Exact match gets highest priority
    const aExact = a.name.toLowerCase() === queryLower ? 1000 : 0
    const bExact = b.name.toLowerCase() === queryLower ? 1000 : 0
    
    // Starts with query gets second priority
    const aStarts = a.name.toLowerCase().startsWith(queryLower) ? 100 : 0
    const bStarts = b.name.toLowerCase().startsWith(queryLower) ? 100 : 0
    
    // Population bonus (if available)
    const aPopulation = a.population ? Math.log10(a.population) : 0
    const bPopulation = b.population ? Math.log10(b.population) : 0
    
    const aScore = aExact + aStarts + aPopulation
    const bScore = bExact + bStarts + bPopulation
    
    return bScore - aScore
  })
}

// Helper functions for airport data (you can expand these)
function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'France': 'FR',
    'Germany': 'DE',
    'Italy': 'IT',
    'Spain': 'ES',
    'Canada': 'CA',
    'Australia': 'AU',
    'Japan': 'JP',
    'China': 'CN',
    'India': 'IN',
    'Brazil': 'BR',
    'Russia': 'RU',
    'South Korea': 'KR',
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'Switzerland': 'CH',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Iran': 'IR',
    'UAE': 'AE',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
    'Turkey': 'TR',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Thailand': 'TH',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'South Africa': 'ZA',
    'Egypt': 'EG',
    'Morocco': 'MA',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE'
  }
  
  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase()
}

function getRegionFromCountry(countryName: string): string {
  const regionMap: Record<string, string> = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Netherlands': 'Europe',
    'Switzerland': 'Europe',
    'Sweden': 'Europe',
    'Norway': 'Europe',
    'Denmark': 'Europe',
    'Finland': 'Europe',
    'Belgium': 'Europe',
    'Austria': 'Europe',
    'Japan': 'Asia',
    'China': 'Asia',
    'India': 'Asia',
    'South Korea': 'Asia',
    'Singapore': 'Asia',
    'Malaysia': 'Asia',
    'Thailand': 'Asia',
    'Indonesia': 'Asia',
    'Philippines': 'Asia',
    'Vietnam': 'Asia',
    'Iran': 'Middle East',
    'UAE': 'Middle East',
    'United Arab Emirates': 'Middle East',
    'Saudi Arabia': 'Middle East',
    'Turkey': 'Middle East',
    'Australia': 'Oceania',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Chile': 'South America',
    'Colombia': 'South America',
    'Peru': 'South America',
    'South Africa': 'Africa',
    'Egypt': 'Africa',
    'Morocco': 'Africa'
  }
  
  return regionMap[countryName] || 'Other'
}

function getAirportsForCity(cityName: string, countryName: string): string[] {
  // This would be expanded with a comprehensive airport database
  // For now, return major airports for major cities
  const airportMap: Record<string, string[]> = {
    'New York': ['JFK', 'LGA', 'EWR'],
    'London': ['LHR', 'LGW', 'STN', 'LTN', 'LCY'],
    'Paris': ['CDG', 'ORY', 'BVA'],
    'Tokyo': ['NRT', 'HND'],
    'Los Angeles': ['LAX', 'BUR', 'LGB'],
    'Chicago': ['ORD', 'MDW'],
    'Dubai': ['DXB', 'DWC'],
    'Singapore': ['SIN'],
    'Hong Kong': ['HKG'],
    'Frankfurt': ['FRA'],
    'Amsterdam': ['AMS'],
    'Madrid': ['MAD'],
    'Barcelona': ['BCN'],
    'Rome': ['FCO', 'CIA'],
    'Milan': ['MXP', 'LIN', 'BGY'],
    'Munich': ['MUC'],
    'Berlin': ['BER'],
    'Sydney': ['SYD'],
    'Melbourne': ['MEL'],
    'Toronto': ['YYZ', 'YTZ'],
    'Vancouver': ['YVR'],
    'Tehran': ['IKA', 'THR'],
    'Istanbul': ['IST', 'SAW']
  }
  
  return airportMap[cityName] || []
}

function getMainAirport(cityName: string, _countryName: string): string | undefined {
  const airports = getAirportsForCity(cityName, _countryName)
  return airports.length > 0 ? airports[0] : undefined
}