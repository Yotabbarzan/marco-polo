import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const searchSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters"),
  limit: z.number().optional().default(10),
})

interface City {
  name: string
  country: string
  countryCode: string
  region: string
  population?: number
  airports: string[]
  mainAirport?: string
}

// Cache to avoid repeated API calls
const cache = new Map<string, { data: City[], timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '10')

    const validation = searchSchema.safeParse({ query, limit })
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      )
    }

    const { query: validQuery, limit: validLimit } = validation.data
    const cacheKey = `${validQuery.toLowerCase()}-${validLimit}`
    const now = Date.now()

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && cached.timestamp + CACHE_DURATION > now) {
      return NextResponse.json({ cities: cached.data })
    }

    // Search cities using multiple sources
    const cities = await searchCitiesFromAPIs(validQuery, validLimit)

    // Cache the results
    cache.set(cacheKey, { data: cities, timestamp: now })

    return NextResponse.json({ cities })
  } catch (error) {
    console.error('City search API error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function searchCitiesFromAPIs(query: string, limit: number): Promise<City[]> {
  const cities: City[] = []

  try {
    // Try REST Countries API first (free, no registration needed)
    const restCountriesResults = await searchRestCountries(query)
    cities.push(...restCountriesResults)

    // If we need more results, try GeoNames API
    if (cities.length < limit) {
      try {
        const geoNamesResults = await searchGeoNames(query, limit - cities.length)
        cities.push(...geoNamesResults)
      } catch (error) {
        console.log('GeoNames API failed, continuing with REST Countries results')
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueCities = removeDuplicates(cities)
    const sortedCities = sortByRelevance(uniqueCities, query)

    return sortedCities.slice(0, limit)
  } catch (error) {
    console.error('All APIs failed:', error)
    // Return comprehensive static fallback
    return getStaticCityResults(query, limit)
  }
}

async function searchRestCountries(query: string): Promise<City[]> {
  const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: '' })
  })

  if (!response.ok) throw new Error('REST Countries API failed')

  const data = await response.json()
  const cities: City[] = []

  data.data?.forEach((country: { country: string; cities: string[] }) => {
    const matchingCities = country.cities?.filter((city: string) =>
      city.toLowerCase().includes(query.toLowerCase())
    ) || []

    matchingCities.forEach((cityName: string) => {
      cities.push({
        name: cityName,
        country: country.country,
        countryCode: getCountryCode(country.country),
        region: getRegion(country.country),
        airports: getAirports(cityName),
        mainAirport: getMainAirport(cityName),
        population: getPopulation(cityName)
      })
    })
  })

  return cities
}

async function searchGeoNames(query: string, limit: number): Promise<City[]> {
  const username = process.env.GEONAMES_USERNAME || 'demo'
  
  const response = await fetch(
    `http://api.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=${limit}&username=${username}&featureClass=P&orderby=population`,
    { headers: { 'User-Agent': 'Marco-Polo-App/1.0' } }
  )

  if (!response.ok) throw new Error('GeoNames API failed')

  const data = await response.json()
  
  return data.geonames?.map((place: {
    name: string;
    countryName: string;
    countryCode: string;
    adminName1: string;
    population: number;
  }) => ({
    name: place.name,
    country: place.countryName,
    countryCode: place.countryCode,
    region: place.adminName1 || getRegion(place.countryName),
    population: place.population,
    airports: getAirports(place.name),
    mainAirport: getMainAirport(place.name)
  })) || []
}

function removeDuplicates(cities: City[]): City[] {
  const seen = new Set<string>()
  return cities.filter(city => {
    const key = `${city.name.toLowerCase()}-${city.countryCode}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sortByRelevance(cities: City[], query: string): City[] {
  return cities.sort((a, b) => {
    const queryLower = query.toLowerCase()
    
    // Exact match priority
    const aExact = a.name.toLowerCase() === queryLower ? 1000 : 0
    const bExact = b.name.toLowerCase() === queryLower ? 1000 : 0
    
    // Starts with query priority
    const aStarts = a.name.toLowerCase().startsWith(queryLower) ? 100 : 0
    const bStarts = b.name.toLowerCase().startsWith(queryLower) ? 100 : 0
    
    // Population bonus
    const aPopulation = a.population ? Math.log10(a.population) : 0
    const bPopulation = b.population ? Math.log10(b.population) : 0
    
    return (bExact + bStarts + bPopulation) - (aExact + aStarts + aPopulation)
  })
}

// Comprehensive static fallback with Iranian cities
function getStaticCityResults(query: string, limit: number): City[] {
  const staticCities: City[] = [
    // Major world cities
    { name: "New York", country: "United States", countryCode: "US", region: "North America", population: 8336817, airports: ["JFK", "LGA", "EWR"], mainAirport: "JFK" },
    { name: "London", country: "United Kingdom", countryCode: "GB", region: "Europe", population: 9648110, airports: ["LHR", "LGW", "STN"], mainAirport: "LHR" },
    { name: "Paris", country: "France", countryCode: "FR", region: "Europe", population: 2161000, airports: ["CDG", "ORY"], mainAirport: "CDG" },
    { name: "Tokyo", country: "Japan", countryCode: "JP", region: "Asia", population: 13960000, airports: ["NRT", "HND"], mainAirport: "NRT" },
    { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", region: "Middle East", population: 3331000, airports: ["DXB"], mainAirport: "DXB" },
    { name: "Singapore", country: "Singapore", countryCode: "SG", region: "Asia", population: 5896000, airports: ["SIN"], mainAirport: "SIN" },
    
    // Iranian cities (including Mazandaran region)
    { name: "Tehran", country: "Iran", countryCode: "IR", region: "Middle East", population: 9134000, airports: ["IKA", "THR"], mainAirport: "IKA" },
    { name: "Isfahan", country: "Iran", countryCode: "IR", region: "Middle East", population: 2220000, airports: ["IFN"], mainAirport: "IFN" },
    { name: "Mashhad", country: "Iran", countryCode: "IR", region: "Middle East", population: 3312000, airports: ["MHD"], mainAirport: "MHD" },
    { name: "Shiraz", country: "Iran", countryCode: "IR", region: "Middle East", population: 1869000, airports: ["SYZ"], mainAirport: "SYZ" },
    { name: "Tabriz", country: "Iran", countryCode: "IR", region: "Middle East", population: 1733000, airports: ["TBZ"], mainAirport: "TBZ" },
    { name: "Karaj", country: "Iran", countryCode: "IR", region: "Middle East", population: 1973000, airports: [], mainAirport: undefined },
    { name: "Ahvaz", country: "Iran", countryCode: "IR", region: "Middle East", population: 1300000, airports: ["AWZ"], mainAirport: "AWZ" },
    { name: "Qom", country: "Iran", countryCode: "IR", region: "Middle East", population: 1200000, airports: [], mainAirport: undefined },
    { name: "Kermanshah", country: "Iran", countryCode: "IR", region: "Middle East", population: 946000, airports: ["KSH"], mainAirport: "KSH" },
    { name: "Urmia", country: "Iran", countryCode: "IR", region: "Middle East", population: 736000, airports: ["OMH"], mainAirport: "OMH" },
    { name: "Rasht", country: "Iran", countryCode: "IR", region: "Middle East", population: 695000, airports: ["RAS"], mainAirport: "RAS" },
    { name: "Zahedan", country: "Iran", countryCode: "IR", region: "Middle East", population: 650000, airports: ["ZAH"], mainAirport: "ZAH" },
    { name: "Hamadan", country: "Iran", countryCode: "IR", region: "Middle East", population: 554000, airports: ["HDM"], mainAirport: "HDM" },
    { name: "Yazd", country: "Iran", countryCode: "IR", region: "Middle East", population: 529000, airports: ["AZD"], mainAirport: "AZD" },
    { name: "Ardabil", country: "Iran", countryCode: "IR", region: "Middle East", population: 529000, airports: ["ADU"], mainAirport: "ADU" },
    { name: "Bandar Abbas", country: "Iran", countryCode: "IR", region: "Middle East", population: 526000, airports: ["BND"], mainAirport: "BND" },
    { name: "Kerman", country: "Iran", countryCode: "IR", region: "Middle East", population: 515000, airports: ["KER"], mainAirport: "KER" },
    { name: "Qazvin", country: "Iran", countryCode: "IR", region: "Middle East", population: 402000, airports: [], mainAirport: undefined },
    
    // Mazandaran province cities
    { name: "Sari", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 309820, airports: ["SRY"], mainAirport: "SRY" },
    { name: "Babol", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 250217, airports: [], mainAirport: undefined },
    { name: "Amol", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 237528, airports: [], mainAirport: undefined },
    { name: "Qaem Shahr", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 204953, airports: [], mainAirport: undefined },
    { name: "Gonbad-e Kavus", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 171405, airports: [], mainAirport: undefined },
    { name: "Behshahr", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 91635, airports: [], mainAirport: undefined },
    { name: "Neka", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 52601, airports: [], mainAirport: undefined },
    { name: "Nowshahr", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 51862, airports: [], mainAirport: undefined },
    { name: "Tonekabon", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 50853, airports: [], mainAirport: undefined },
    { name: "Chalus", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 50532, airports: [], mainAirport: undefined },
    { name: "Babolsar", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 48029, airports: [], mainAirport: undefined },
    { name: "Ramsar", country: "Iran", countryCode: "IR", region: "Mazandaran", population: 32647, airports: [], mainAirport: undefined }
  ]

  const queryLower = query.toLowerCase()
  return staticCities
    .filter(city => 
      city.name.toLowerCase().includes(queryLower) ||
      city.country.toLowerCase().includes(queryLower) ||
      city.region.toLowerCase().includes(queryLower)
    )
    .sort((a, b) => {
      // Exact match first
      const aExact = a.name.toLowerCase() === queryLower ? 1000 : 0
      const bExact = b.name.toLowerCase() === queryLower ? 1000 : 0
      
      // Starts with query second
      const aStarts = a.name.toLowerCase().startsWith(queryLower) ? 100 : 0
      const bStarts = b.name.toLowerCase().startsWith(queryLower) ? 100 : 0
      
      // Population third
      const aPopulation = a.population || 0
      const bPopulation = b.population || 0
      
      return (bExact + bStarts + bPopulation) - (aExact + aStarts + aPopulation)
    })
    .slice(0, limit)
}

// Helper functions (simplified versions)
function getCountryCode(country: string): string {
  const map: Record<string, string> = {
    'United States': 'US', 'United Kingdom': 'GB', 'France': 'FR', 'Germany': 'DE',
    'Italy': 'IT', 'Spain': 'ES', 'Japan': 'JP', 'China': 'CN', 'India': 'IN',
    'Iran': 'IR', 'United Arab Emirates': 'AE', 'Singapore': 'SG', 'Canada': 'CA'
  }
  return map[country] || country.substring(0, 2).toUpperCase()
}

function getRegion(country: string): string {
  const map: Record<string, string> = {
    'United States': 'North America', 'Canada': 'North America',
    'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
    'Japan': 'Asia', 'China': 'Asia', 'Singapore': 'Asia',
    'Iran': 'Middle East', 'United Arab Emirates': 'Middle East'
  }
  return map[country] || 'Other'
}

function getAirports(cityName: string): string[] {
  const map: Record<string, string[]> = {
    'New York': ['JFK', 'LGA', 'EWR'], 'London': ['LHR', 'LGW', 'STN'],
    'Paris': ['CDG', 'ORY'], 'Tokyo': ['NRT', 'HND'], 'Tehran': ['IKA', 'THR'],
    'Dubai': ['DXB'], 'Singapore': ['SIN'], 'Isfahan': ['IFN'], 'Mashhad': ['MHD'],
    'Shiraz': ['SYZ'], 'Sari': ['SRY']
  }
  return map[cityName] || []
}

function getMainAirport(cityName: string): string | undefined {
  const airports = getAirports(cityName)
  return airports.length > 0 ? airports[0] : undefined
}

function getPopulation(cityName: string): number | undefined {
  const map: Record<string, number> = {
    'New York': 8336817, 'London': 9648110, 'Paris': 2161000, 'Tokyo': 13960000,
    'Tehran': 9134000, 'Isfahan': 2220000, 'Mashhad': 3312000, 'Shiraz': 1869000,
    'Dubai': 3331000, 'Singapore': 5896000, 'Sari': 309820, 'Babol': 250217
  }
  return map[cityName]
}