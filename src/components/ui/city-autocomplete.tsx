"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchCitiesAPI, type ApiCity } from "@/lib/api-cities"
import { searchCities, type City } from "@/lib/cities"
import { MapPin, Plane, Loader2 } from "lucide-react"

interface CityAutocompleteProps {
  label: string
  placeholder?: string
  value: string
  onCitySelect: (city: City | ApiCity) => void
  onInputChange: (value: string) => void
  required?: boolean
  id?: string
  className?: string
  useAPI?: boolean // Toggle between API and static data
}

export function CityAutocomplete({
  label,
  placeholder,
  value,
  onCitySelect,
  onInputChange,
  required = false,
  id,
  className = "",
  useAPI = true // Default to API for comprehensive coverage
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<(City | ApiCity)[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchCitiesDelayed = async () => {
      if (value && value.length >= 2) {
        setIsLoading(true)
        try {
          let results: (City | ApiCity)[] = []
          
          if (useAPI) {
            // Use API for comprehensive coverage
            results = await searchCitiesAPI(value, 10)
            
            // Fallback to static data if API fails or returns no results
            if (results.length === 0) {
              results = searchCities(value)
            }
          } else {
            // Use static data only
            results = searchCities(value)
          }
          
          setSuggestions(results)
          setIsOpen(results.length > 0)
        } catch (error) {
          console.error('City search error:', error)
          // Fallback to static data on API error
          const fallbackResults = searchCities(value)
          setSuggestions(fallbackResults)
          setIsOpen(fallbackResults.length > 0)
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setIsOpen(false)
        setIsLoading(false)
      }
      setHighlightedIndex(-1)
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchCitiesDelayed, 300)
    return () => clearTimeout(timeoutId)
  }, [value, useAPI])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onInputChange(inputValue)
  }

  const handleSuggestionClick = (city: City | ApiCity) => {
    onCitySelect(city)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (value && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gray-400 absolute right-3 top-3 animate-spin" />
        )}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`pl-9 ${isLoading ? 'pr-9' : ''}`}
          required={required}
          autoComplete="off"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((city, index) => {
            // Handle both City and ApiCity types
            const airports = 'airports' in city ? city.airports : []
            const mainAirport = 'mainAirport' in city ? city.mainAirport : airports[0]
            const region = 'region' in city ? city.region : undefined
            const population = 'population' in city ? city.population : undefined
            
            return (
              <div
                key={`${city.name}-${city.countryCode}-${index}`}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-slate-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionClick(city)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plane className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 truncate">
                        {city.name}
                      </p>
                      {mainAirport && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {mainAirport}
                        </span>
                      )}
                      {population && population > 1000000 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {(population / 1000000).toFixed(1)}M
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {city.country}
                      {region && region !== city.country && (
                        <span className="text-gray-400"> • {region}</span>
                      )}
                    </p>
                    {airports.length > 1 && (
                      <p className="text-xs text-gray-400">
                        Airports: {airports.slice(0, 3).join(", ")}
                        {airports.length > 3 && ` +${airports.length - 3} more`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}