// City data with airport codes and countries for autocomplete
export interface City {
  name: string
  country: string
  countryCode: string
  airports: string[]
  mainAirport?: string
}

export const cities: City[] = [
  // United States
  { name: "New York", country: "United States", countryCode: "US", airports: ["JFK", "LGA", "EWR"], mainAirport: "JFK" },
  { name: "Los Angeles", country: "United States", countryCode: "US", airports: ["LAX", "BUR", "LGB"], mainAirport: "LAX" },
  { name: "Chicago", country: "United States", countryCode: "US", airports: ["ORD", "MDW"], mainAirport: "ORD" },
  { name: "Miami", country: "United States", countryCode: "US", airports: ["MIA", "FLL"], mainAirport: "MIA" },
  { name: "San Francisco", country: "United States", countryCode: "US", airports: ["SFO", "OAK", "SJC"], mainAirport: "SFO" },
  { name: "Boston", country: "United States", countryCode: "US", airports: ["BOS"], mainAirport: "BOS" },
  { name: "Washington", country: "United States", countryCode: "US", airports: ["DCA", "IAD", "BWI"], mainAirport: "DCA" },
  { name: "Atlanta", country: "United States", countryCode: "US", airports: ["ATL"], mainAirport: "ATL" },
  { name: "Dallas", country: "United States", countryCode: "US", airports: ["DFW", "DAL"], mainAirport: "DFW" },
  { name: "Seattle", country: "United States", countryCode: "US", airports: ["SEA"], mainAirport: "SEA" },

  // United Kingdom
  { name: "London", country: "United Kingdom", countryCode: "GB", airports: ["LHR", "LGW", "STN", "LTN", "LCY"], mainAirport: "LHR" },
  { name: "Manchester", country: "United Kingdom", countryCode: "GB", airports: ["MAN"], mainAirport: "MAN" },
  { name: "Birmingham", country: "United Kingdom", countryCode: "GB", airports: ["BHX"], mainAirport: "BHX" },
  { name: "Edinburgh", country: "United Kingdom", countryCode: "GB", airports: ["EDI"], mainAirport: "EDI" },
  { name: "Glasgow", country: "United Kingdom", countryCode: "GB", airports: ["GLA"], mainAirport: "GLA" },

  // France
  { name: "Paris", country: "France", countryCode: "FR", airports: ["CDG", "ORY", "BVA"], mainAirport: "CDG" },
  { name: "Nice", country: "France", countryCode: "FR", airports: ["NCE"], mainAirport: "NCE" },
  { name: "Lyon", country: "France", countryCode: "FR", airports: ["LYS"], mainAirport: "LYS" },
  { name: "Marseille", country: "France", countryCode: "FR", airports: ["MRS"], mainAirport: "MRS" },

  // Germany
  { name: "Berlin", country: "Germany", countryCode: "DE", airports: ["BER"], mainAirport: "BER" },
  { name: "Munich", country: "Germany", countryCode: "DE", airports: ["MUC"], mainAirport: "MUC" },
  { name: "Frankfurt", country: "Germany", countryCode: "DE", airports: ["FRA"], mainAirport: "FRA" },
  { name: "Hamburg", country: "Germany", countryCode: "DE", airports: ["HAM"], mainAirport: "HAM" },
  { name: "Cologne", country: "Germany", countryCode: "DE", airports: ["CGN"], mainAirport: "CGN" },

  // Spain
  { name: "Madrid", country: "Spain", countryCode: "ES", airports: ["MAD"], mainAirport: "MAD" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", airports: ["BCN"], mainAirport: "BCN" },
  { name: "Valencia", country: "Spain", countryCode: "ES", airports: ["VLC"], mainAirport: "VLC" },
  { name: "Seville", country: "Spain", countryCode: "ES", airports: ["SVQ"], mainAirport: "SVQ" },

  // Italy
  { name: "Rome", country: "Italy", countryCode: "IT", airports: ["FCO", "CIA"], mainAirport: "FCO" },
  { name: "Milan", country: "Italy", countryCode: "IT", airports: ["MXP", "LIN", "BGY"], mainAirport: "MXP" },
  { name: "Venice", country: "Italy", countryCode: "IT", airports: ["VCE"], mainAirport: "VCE" },
  { name: "Florence", country: "Italy", countryCode: "IT", airports: ["FLR"], mainAirport: "FLR" },

  // Canada
  { name: "Toronto", country: "Canada", countryCode: "CA", airports: ["YYZ", "YTZ"], mainAirport: "YYZ" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", airports: ["YVR"], mainAirport: "YVR" },
  { name: "Montreal", country: "Canada", countryCode: "CA", airports: ["YUL"], mainAirport: "YUL" },
  { name: "Calgary", country: "Canada", countryCode: "CA", airports: ["YYC"], mainAirport: "YYC" },

  // Japan
  { name: "Tokyo", country: "Japan", countryCode: "JP", airports: ["NRT", "HND"], mainAirport: "NRT" },
  { name: "Osaka", country: "Japan", countryCode: "JP", airports: ["KIX", "ITM"], mainAirport: "KIX" },
  { name: "Kyoto", country: "Japan", countryCode: "JP", airports: ["KIX"], mainAirport: "KIX" },

  // Australia
  { name: "Sydney", country: "Australia", countryCode: "AU", airports: ["SYD"], mainAirport: "SYD" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", airports: ["MEL"], mainAirport: "MEL" },
  { name: "Brisbane", country: "Australia", countryCode: "AU", airports: ["BNE"], mainAirport: "BNE" },
  { name: "Perth", country: "Australia", countryCode: "AU", airports: ["PER"], mainAirport: "PER" },

  // Middle East
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", airports: ["DXB", "DWC"], mainAirport: "DXB" },
  { name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", airports: ["AUH"], mainAirport: "AUH" },
  { name: "Doha", country: "Qatar", countryCode: "QA", airports: ["DOH"], mainAirport: "DOH" },
  { name: "Kuwait City", country: "Kuwait", countryCode: "KW", airports: ["KWI"], mainAirport: "KWI" },

  // Asia
  { name: "Singapore", country: "Singapore", countryCode: "SG", airports: ["SIN"], mainAirport: "SIN" },
  { name: "Hong Kong", country: "Hong Kong", countryCode: "HK", airports: ["HKG"], mainAirport: "HKG" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", airports: ["BKK", "DMK"], mainAirport: "BKK" },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", airports: ["KUL"], mainAirport: "KUL" },

  // Iran (Persian Gulf region)
  { name: "Tehran", country: "Iran", countryCode: "IR", airports: ["IKA", "THR"], mainAirport: "IKA" },
  { name: "Isfahan", country: "Iran", countryCode: "IR", airports: ["IFN"], mainAirport: "IFN" },
  { name: "Shiraz", country: "Iran", countryCode: "IR", airports: ["SYZ"], mainAirport: "SYZ" },
  { name: "Mashhad", country: "Iran", countryCode: "IR", airports: ["MHD"], mainAirport: "MHD" },

  // India
  { name: "Mumbai", country: "India", countryCode: "IN", airports: ["BOM"], mainAirport: "BOM" },
  { name: "Delhi", country: "India", countryCode: "IN", airports: ["DEL"], mainAirport: "DEL" },
  { name: "Bangalore", country: "India", countryCode: "IN", airports: ["BLR"], mainAirport: "BLR" },
  { name: "Chennai", country: "India", countryCode: "IN", airports: ["MAA"], mainAirport: "MAA" },

  // Additional popular destinations
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", airports: ["AMS"], mainAirport: "AMS" },
  { name: "Brussels", country: "Belgium", countryCode: "BE", airports: ["BRU"], mainAirport: "BRU" },
  { name: "Vienna", country: "Austria", countryCode: "AT", airports: ["VIE"], mainAirport: "VIE" },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", airports: ["ZUR"], mainAirport: "ZUR" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", airports: ["ARN"], mainAirport: "ARN" },
  { name: "Oslo", country: "Norway", countryCode: "NO", airports: ["OSL"], mainAirport: "OSL" },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", airports: ["CPH"], mainAirport: "CPH" },
  { name: "Helsinki", country: "Finland", countryCode: "FI", airports: ["HEL"], mainAirport: "HEL" },
]

export function searchCities(query: string): City[] {
  if (!query || query.length < 2) return []
  
  const normalizedQuery = query.toLowerCase().trim()
  
  return cities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery) ||
      city.airports.some(airport => airport.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, 10) // Limit to 10 results for performance
}

export function getCityByName(cityName: string): City | undefined {
  return cities.find(city => 
    city.name.toLowerCase() === cityName.toLowerCase()
  )
}