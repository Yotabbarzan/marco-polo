"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import { Package, MapPin, Weight, DollarSign, ArrowLeft } from "lucide-react"
import type { City } from "@/lib/cities"
import type { ApiCity } from "@/lib/api-cities"

interface SenderPostData {
  originCountry: string
  originCity: string
  originAddress: string
  destinationCountry: string
  destinationCity: string
  destinationAddress: string
  itemCategory: string
  itemDescription: string
  weight: string
  specialNotes: string
  pickupNotes: string
  deliveryNotes: string
  maxPrice: string
}

const ITEM_CATEGORIES = [
  "Documents",
  "Electronics", 
  "Clothing",
  "Books",
  "Gifts",
  "Food Items",
  "Medicine",
  "Personal Items",
  "Art & Crafts",
  "Other"
]

export default function CreateSenderPost() {
  const { status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<SenderPostData>({
    originCountry: "",
    originCity: "",
    originAddress: "",
    destinationCountry: "",
    destinationCity: "",
    destinationAddress: "",
    itemCategory: "",
    itemDescription: "",
    weight: "",
    specialNotes: "",
    pickupNotes: "",
    deliveryNotes: "",
    maxPrice: "",
  })
  
  // Separate state for city search inputs
  const [originCityInput, setOriginCityInput] = useState("")
  const [destinationCityInput, setDestinationCityInput] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  const handleInputChange = (field: keyof SenderPostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOriginCitySelect = (city: City | ApiCity) => {
    setFormData(prev => ({
      ...prev,
      originCountry: city.country,
      originCity: city.name,
    }))
    setOriginCityInput(city.name)
  }

  const handleDestinationCitySelect = (city: City | ApiCity) => {
    setFormData(prev => ({
      ...prev,
      destinationCountry: city.country,
      destinationCity: city.name,
    }))
    setDestinationCityInput(city.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.originCountry || !formData.destinationCountry || !formData.itemCategory || !formData.itemDescription) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (parseFloat(formData.weight) <= 0) {
      setError("Weight must be greater than 0")
      setIsLoading(false)
      return
    }

    if (formData.maxPrice && parseFloat(formData.maxPrice) <= 0) {
      setError("Max price must be greater than 0")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/posts/sender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        }),
      })

      if (response.ok) {
        router.push("/posts/senders?message=Post created successfully!")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create post")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-8">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/marcopolo-360-logo.png"
                  alt="Marcopolo 360 Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Send an Item</h1>
                <p className="text-sm text-gray-600">Find travelers to carry your items</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-slate-600" />
              <span>Item Delivery Details</span>
            </CardTitle>
            <CardDescription>
              Create a post to find travelers who can carry your items
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* Origin Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Origin Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CityAutocomplete
                    label="Origin City"
                    placeholder="Search for origin city..."
                    value={originCityInput}
                    onCitySelect={handleOriginCitySelect}
                    onInputChange={setOriginCityInput}
                    required
                    id="originCity"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="originCountry">Country</Label>
                    <Input
                      id="originCountry"
                      placeholder="Auto-filled when city is selected"
                      value={formData.originCountry}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originAddress">Address (Optional)</Label>
                  <Input
                    id="originAddress"
                    placeholder="Specific pickup address or area"
                    value={formData.originAddress}
                    onChange={(e) => handleInputChange("originAddress", e.target.value)}
                  />
                </div>
              </div>

              {/* Destination Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>Destination Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CityAutocomplete
                    label="Destination City"
                    placeholder="Search for destination city..."
                    value={destinationCityInput}
                    onCitySelect={handleDestinationCitySelect}
                    onInputChange={setDestinationCityInput}
                    required
                    id="destinationCity"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="destinationCountry">Country</Label>
                    <Input
                      id="destinationCountry"
                      placeholder="Auto-filled when city is selected"
                      value={formData.destinationCountry}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationAddress">Address (Optional)</Label>
                  <Input
                    id="destinationAddress"
                    placeholder="Specific delivery address or area"
                    value={formData.destinationAddress}
                    onChange={(e) => handleInputChange("destinationAddress", e.target.value)}
                  />
                </div>
              </div>

              {/* Item Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Item Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemCategory">Category *</Label>
                    <Select value={formData.itemCategory} onValueChange={(value) => handleInputChange("itemCategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <div className="relative">
                      <Weight className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g., 2.5"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Item Description *</Label>
                  <Textarea
                    id="itemDescription"
                    placeholder="Describe what you need to send (size, fragility, special handling, etc.)"
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Price (USD)</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <Input
                      id="maxPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Maximum you're willing to pay"
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Delivery Instructions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupNotes">Pickup Notes</Label>
                    <Textarea
                      id="pickupNotes"
                      placeholder="Special instructions for item pickup"
                      value={formData.pickupNotes}
                      onChange={(e) => handleInputChange("pickupNotes", e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                    <Textarea
                      id="deliveryNotes"
                      placeholder="Special instructions for item delivery"
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange("deliveryNotes", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <Label htmlFor="specialNotes">Special Notes</Label>
                <Textarea
                  id="specialNotes"
                  placeholder="Any additional requirements, restrictions, or important information..."
                  value={formData.specialNotes}
                  onChange={(e) => handleInputChange("specialNotes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-700 hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? "Creating Post..." : "Create Sender Post"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}