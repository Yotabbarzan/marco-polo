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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, MapPin, Weight, DollarSign, ArrowLeft } from "lucide-react"

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

export default function CreateTravellerPost() {
  const { status } = useSession()
  const router = useRouter()
  
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

  const handleInputChange = (field: keyof TravellerPostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.departureCountry || !formData.arrivalCountry || !formData.departureDate || !formData.arrivalDate) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (parseFloat(formData.availableWeight) <= 0) {
      setError("Available weight must be greater than 0")
      setIsLoading(false)
      return
    }

    if (parseFloat(formData.pricePerKg) <= 0) {
      setError("Price per kg must be greater than 0")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/posts/traveller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          availableWeight: parseFloat(formData.availableWeight),
          pricePerKg: parseFloat(formData.pricePerKg),
          departureDate: new Date(formData.departureDate),
          arrivalDate: new Date(formData.arrivalDate),
        }),
      })

      if (response.ok) {
        router.push("/posts/travellers?message=Post created successfully!")
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
                <h1 className="text-xl font-semibold text-gray-900">Create Traveller Post</h1>
                <p className="text-sm text-gray-600">Offer your luggage space to earn money</p>
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
              <Plane className="w-5 h-5 text-slate-600" />
              <span>Share Your Travel Details</span>
            </CardTitle>
            <CardDescription>
              Create a post to offer luggage space on your upcoming trip
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="departureCountry">Country *</Label>
                    <Input
                      id="departureCountry"
                      placeholder="e.g., United States"
                      value={formData.departureCountry}
                      onChange={(e) => handleInputChange("departureCountry", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="departureCity">City</Label>
                    <Input
                      id="departureCity"
                      placeholder="e.g., New York"
                      value={formData.departureCity}
                      onChange={(e) => handleInputChange("departureCity", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureAirport">Airport Code</Label>
                    <Input
                      id="departureAirport"
                      placeholder="e.g., JFK"
                      value={formData.departureAirport}
                      onChange={(e) => handleInputChange("departureAirport", e.target.value)}
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
                  <div className="space-y-2">
                    <Label htmlFor="arrivalCountry">Country *</Label>
                    <Input
                      id="arrivalCountry"
                      placeholder="e.g., United Kingdom"
                      value={formData.arrivalCountry}
                      onChange={(e) => handleInputChange("arrivalCountry", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="arrivalCity">City</Label>
                    <Input
                      id="arrivalCity"
                      placeholder="e.g., London"
                      value={formData.arrivalCity}
                      onChange={(e) => handleInputChange("arrivalCity", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrivalAirport">Airport Code</Label>
                    <Input
                      id="arrivalAirport"
                      placeholder="e.g., LHR"
                      value={formData.arrivalAirport}
                      onChange={(e) => handleInputChange("arrivalAirport", e.target.value)}
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

              <Button
                type="submit"
                className="w-full bg-slate-700 hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? "Creating Post..." : "Create Traveller Post"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}