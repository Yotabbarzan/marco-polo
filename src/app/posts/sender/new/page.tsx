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
import { Package, ArrowLeft } from "lucide-react"
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
  additionalNotes: string
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
    additionalNotes: "",
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

    // Weight validation - extract number from string like "3 kg"
    const weightStr = formData.weight.replace(/[^\d.]/g, '')
    const weightNum = parseFloat(weightStr)
    if (!weightNum || weightNum <= 0) {
      setError("Please enter a valid weight")
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
          originCountry: formData.originCountry,
          originCity: formData.originCity,
          originAddress: formData.originAddress || undefined,
          destinationCountry: formData.destinationCountry,
          destinationCity: formData.destinationCity,
          destinationAddress: formData.destinationAddress || undefined,
          itemCategory: formData.itemCategory,
          itemDescription: formData.itemDescription,
          weight: weightNum,
          specialNotes: formData.specialNotes || undefined,
          pickupNotes: formData.pickupNotes || undefined,
          deliveryNotes: formData.deliveryNotes || undefined,
          // For now, we'll put additional notes in specialNotes field
          ...(formData.additionalNotes && { 
            specialNotes: [formData.specialNotes, formData.additionalNotes].filter(Boolean).join('. ')
          })
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

              {/* Origin / Destination */}
              <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900">Origin / Destination</h3>
                
                {/* Origin */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-16">Origin</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <div className="space-y-2">
                      <Label htmlFor="originCountry" className="text-sm">Country</Label>
                      <Input
                        id="originCountry"
                        placeholder="Auto-filled"
                        value={formData.originCountry}
                        readOnly
                        className="bg-gray-50 h-9"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <CityAutocomplete
                        label="City"
                        placeholder="Search city..."
                        value={originCityInput}
                        onCitySelect={handleOriginCitySelect}
                        onInputChange={setOriginCityInput}
                        required
                        id="originCity"
                      />
                    </div>
                  </div>

                  <div className="ml-4 space-y-2">
                    <Label htmlFor="originAddress" className="text-sm">Address</Label>
                    <Input
                      id="originAddress"
                      placeholder="Pickup address"
                      value={formData.originAddress}
                      onChange={(e) => handleInputChange("originAddress", e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">Destination</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinationCountry" className="text-sm">Country</Label>
                      <Input
                        id="destinationCountry"
                        placeholder="Auto-filled"
                        value={formData.destinationCountry}
                        readOnly
                        className="bg-gray-50 h-9"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <CityAutocomplete
                        label="City"
                        placeholder="Search city..."
                        value={destinationCityInput}
                        onCitySelect={handleDestinationCitySelect}
                        onInputChange={setDestinationCityInput}
                        required
                        id="destinationCity"
                      />
                    </div>
                  </div>

                  <div className="ml-4 space-y-2">
                    <Label htmlFor="destinationAddress" className="text-sm">Address</Label>
                    <Input
                      id="destinationAddress"
                      placeholder="Delivery address"
                      value={formData.destinationAddress}
                      onChange={(e) => handleInputChange("destinationAddress", e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Luggage Information */}
              <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900">Luggage Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Items Category and Weight */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemCategory" className="text-sm font-medium">Items Category</Label>
                      <Select value={formData.itemCategory} onValueChange={(value) => handleInputChange("itemCategory", value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
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
                      <Label htmlFor="weight" className="text-sm font-medium">Weight</Label>
                      <Input
                        id="weight"
                        type="text"
                        placeholder="e.g., 3 kg"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemDescription" className="text-sm font-medium">Description</Label>
                      <Input
                        id="itemDescription"
                        placeholder="Brief item description"
                        value={formData.itemDescription}
                        onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialNotes" className="text-sm font-medium">Special Note</Label>
                      <Input
                        id="specialNotes"
                        placeholder="Any special requirements"
                        value={formData.specialNotes}
                        onChange={(e) => handleInputChange("specialNotes", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Upload Photo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload Photo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-40 flex items-center justify-center">
                      <div className="text-gray-500">
                        <Package className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs text-gray-400">or drag and drop</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900">Delivery</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupNotes" className="text-sm font-medium">Pick up</Label>
                    <Input
                      id="pickupNotes"
                      placeholder="Pickup instructions"
                      value={formData.pickupNotes}
                      onChange={(e) => handleInputChange("pickupNotes", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes" className="text-sm font-medium">Delivery</Label>
                    <Input
                      id="deliveryNotes"
                      placeholder="Delivery instructions"
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange("deliveryNotes", e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes" className="text-sm font-medium">Note</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Additional delivery instructions..."
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Post Button */}
              <div className="flex justify-start">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Posting..." : "Post"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}