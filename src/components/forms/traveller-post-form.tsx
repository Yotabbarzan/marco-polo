"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import { MapPin, Weight, DollarSign } from "lucide-react"
import type { City } from "@/lib/cities"
import type { ApiCity } from "@/lib/api-cities"

interface TravellerPostData {
  departureCountry: string
  departureCity: string
  departureAirport: string
  departureDate: string
  departureTime: string
  arrivalCountry: string
  arrivalCity: string
  arrivalAirport: string
  arrivalDate: string
  arrivalTime: string
  availableWeight: string
  pricePerKg: string
  specialNotes: string
  pickupLocation: string
  deliveryLocation: string
}

interface TravellerPostFormProps {
  onSubmit: (data: {
    departureCountry: string
    departureCity: string
    departureAirport?: string
    departureDate: Date
    departureTime?: string
    arrivalCountry: string
    arrivalCity: string
    arrivalAirport?: string
    arrivalDate: Date
    arrivalTime?: string
    availableWeight: number
    pricePerKg: number
    specialNotes?: string
    pickupLocation?: string
    deliveryLocation?: string
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TravellerPostForm({ onSubmit, onCancel, isLoading = false }: TravellerPostFormProps) {
  const [formData, setFormData] = useState<TravellerPostData>({
    departureCountry: "",
    departureCity: "",
    departureAirport: "",
    departureDate: "",
    departureTime: "",
    arrivalCountry: "",
    arrivalCity: "",
    arrivalAirport: "",
    arrivalDate: "",
    arrivalTime: "",
    availableWeight: "",
    pricePerKg: "",
    specialNotes: "",
    pickupLocation: "",
    deliveryLocation: "",
  })
  
  // Separate state for city search inputs
  const [departureCityInput, setDepartureCityInput] = useState("")
  const [arrivalCityInput, setArrivalCityInput] = useState("")
  
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof TravellerPostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDepartureCitySelect = (city: City | ApiCity) => {
    const airports = 'airports' in city ? city.airports : []
    const mainAirport = 'mainAirport' in city ? city.mainAirport : airports[0]
    
    setFormData(prev => ({
      ...prev,
      departureCountry: city.country,
      departureCity: city.name,
      departureAirport: mainAirport || "",
    }))
    setDepartureCityInput(city.name)
  }

  const handleArrivalCitySelect = (city: City | ApiCity) => {
    const airports = 'airports' in city ? city.airports : []
    const mainAirport = 'mainAirport' in city ? city.mainAirport : airports[0]
    
    setFormData(prev => ({
      ...prev,
      arrivalCountry: city.country,
      arrivalCity: city.name,
      arrivalAirport: mainAirport || "",
    }))
    setArrivalCityInput(city.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.departureCountry || !formData.arrivalCountry || !formData.departureDate || !formData.arrivalDate) {
      setError("Please fill in all required fields")
      return
    }

    if (parseFloat(formData.availableWeight) <= 0) {
      setError("Available weight must be greater than 0")
      return
    }

    if (parseFloat(formData.pricePerKg) <= 0) {
      setError("Price per kg must be greater than 0")
      return
    }

    try {
      await onSubmit({
        ...formData,
        availableWeight: parseFloat(formData.availableWeight),
        pricePerKg: parseFloat(formData.pricePerKg),
        departureDate: new Date(formData.departureDate),
        arrivalDate: new Date(formData.arrivalDate),
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again."
      setError(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Departure Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>Departure Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CityAutocomplete
            label="Departure City"
            placeholder="Search for departure city..."
            value={departureCityInput}
            onCitySelect={handleDepartureCitySelect}
            onInputChange={setDepartureCityInput}
            required
            id="departureCity"
          />
          
          <div className="space-y-2">
            <Label htmlFor="departureCountry">Country</Label>
            <Input
              id="departureCountry"
              placeholder="Auto-filled when city is selected"
              value={formData.departureCountry}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureAirport">Airport Code</Label>
            <Input
              id="departureAirport"
              placeholder="Auto-filled from city"
              value={formData.departureAirport}
              onChange={(e) => handleInputChange("departureAirport", e.target.value)}
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="departureDate">Date *</Label>
            <Input
              id="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleInputChange("departureDate", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="departureTime">Time</Label>
            <Input
              id="departureTime"
              type="time"
              value={formData.departureTime}
              onChange={(e) => handleInputChange("departureTime", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Arrival Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-600" />
          <span>Arrival Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CityAutocomplete
            label="Arrival City"
            placeholder="Search for arrival city..."
            value={arrivalCityInput}
            onCitySelect={handleArrivalCitySelect}
            onInputChange={setArrivalCityInput}
            required
            id="arrivalCity"
          />
          
          <div className="space-y-2">
            <Label htmlFor="arrivalCountry">Country</Label>
            <Input
              id="arrivalCountry"
              placeholder="Auto-filled when city is selected"
              value={formData.arrivalCountry}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="arrivalAirport">Airport Code</Label>
            <Input
              id="arrivalAirport"
              placeholder="Auto-filled from city"
              value={formData.arrivalAirport}
              onChange={(e) => handleInputChange("arrivalAirport", e.target.value)}
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="arrivalDate">Date *</Label>
            <Input
              id="arrivalDate"
              type="date"
              value={formData.arrivalDate}
              onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="arrivalTime">Time</Label>
            <Input
              id="arrivalTime"
              type="time"
              value={formData.arrivalTime}
              onChange={(e) => handleInputChange("arrivalTime", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Luggage Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Weight className="w-5 h-5 text-blue-600" />
          <span>Luggage Space Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="availableWeight">Available Weight (kg) *</Label>
            <Input
              id="availableWeight"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g., 15"
              value={formData.availableWeight}
              onChange={(e) => handleInputChange("availableWeight", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePerKg">Price per kg (USD) *</Label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <Input
                id="pricePerKg"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formData.pricePerKg}
                onChange={(e) => handleInputChange("pricePerKg", e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Delivery Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              placeholder="Where you can collect items"
              value={formData.pickupLocation}
              onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input
              id="deliveryLocation"
              placeholder="Where you can deliver items"
              value={formData.deliveryLocation}
              onChange={(e) => handleInputChange("deliveryLocation", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Special Notes */}
      <div className="space-y-2">
        <Label htmlFor="specialNotes">Special Notes</Label>
        <Textarea
          id="specialNotes"
          placeholder="Any special requirements, restrictions, or additional information..."
          value={formData.specialNotes}
          onChange={(e) => handleInputChange("specialNotes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button onClick={onCancel} variant="outline" className="flex-1" type="button">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? "Creating Post..." : "Create Post"}
        </Button>
      </div>
    </form>
  )
}