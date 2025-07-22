"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import type { City } from "@/lib/cities"
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Weight, 
  DollarSign, 
  Star, 
  Search,
  Plus,
  Filter,
  ArrowLeft,
  Clock,
  User
} from "lucide-react"

interface TravellerPost {
  id: string
  departureCountry: string
  departureCity?: string
  departureAirport?: string
  departureDate: string
  departureTime?: string
  arrivalCountry: string
  arrivalCity?: string
  arrivalAirport?: string
  arrivalDate: string
  arrivalTime?: string
  availableWeight: number
  pricePerKg: number
  specialNotes?: string
  pickupLocation?: string
  deliveryLocation?: string
  status: string
  createdAt: string
  user: {
    id: string
    name?: string
    lastName?: string
    rating?: number
    totalTrips: number
    image?: string
  }
  _count: {
    requests: number
  }
}

interface PostsResponse {
  posts: TravellerPost[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

function TravellerPostsContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [posts, setPosts] = useState<TravellerPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const [filters, setFilters] = useState({
    departureCountry: "",
    arrivalCountry: "",
    dateFrom: "",
    dateTo: "",
  })
  
  // City autocomplete inputs
  const [departureCityInput, setDepartureCityInput] = useState("")
  const [arrivalCityInput, setArrivalCityInput] = useState("")

  const successMessage = searchParams.get('message')

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filters.departureCountry && { departureCountry: filters.departureCountry }),
        ...(filters.arrivalCountry && { arrivalCountry: filters.arrivalCountry }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      })

      const response = await fetch(`/api/posts/traveller?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data: PostsResponse = await response.json()
      setPosts(data.posts)
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNextPage,
        hasPrevPage: data.pagination.hasPrevPage
      })
    } catch (err) {
      setError("Failed to load traveller posts")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleDepartureCitySelect = (city: City) => {
    setFilters(prev => ({ ...prev, departureCountry: city.country }))
    setDepartureCityInput(city.name)
  }

  const handleArrivalCitySelect = (city: City) => {
    setFilters(prev => ({ ...prev, arrivalCountry: city.country }))
    setArrivalCityInput(city.name)
  }

  const handleSearch = () => {
    fetchPosts(1)
  }

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatLocation = (country: string, city?: string, airport?: string) => {
    const parts = [city, country].filter(Boolean)
    if (airport) {
      parts.push(`(${airport})`)
    }
    return parts.join(', ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <h1 className="text-xl font-semibold text-gray-900">Traveller Posts</h1>
                <p className="text-sm text-gray-600">Find travelers offering luggage space</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {status === "authenticated" && (
                <Link href="/posts/traveller/new">
                  <Button className="bg-slate-700 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CityAutocomplete
                label="From City"
                placeholder="Search departure city..."
                value={departureCityInput}
                onCitySelect={handleDepartureCitySelect}
                onInputChange={setDepartureCityInput}
                id="departureCity"
              />
              
              <CityAutocomplete
                label="To City"
                placeholder="Search arrival city..."
                value={arrivalCityInput}
                onCitySelect={handleArrivalCitySelect}
                onInputChange={setArrivalCityInput}
                id="arrivalCity"
              />
              
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={handleSearch} className="bg-slate-700 hover:bg-slate-800">
                <Search className="w-4 h-4 mr-2" />
                Search Posts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading posts...</div>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {post.user.image ? (
                            <Image
                              src={post.user.image}
                              alt={`${post.user.name} avatar`}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {post.user.name} {post.user.lastName}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            {post.user.rating && (
                              <>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{post.user.rating.toFixed(1)}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{post.user.totalTrips} trips</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {post.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">From:</span>
                        <span>{formatLocation(post.departureCountry, post.departureCity, post.departureAirport)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="font-medium">To:</span>
                        <span>{formatLocation(post.arrivalCountry, post.arrivalCity, post.arrivalAirport)}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Departure:</span>
                        <span>{formatDate(post.departureDate)}</span>
                        {post.departureTime && (
                          <>
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{post.departureTime}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Arrival:</span>
                        <span>{formatDate(post.arrivalDate)}</span>
                        {post.arrivalTime && (
                          <>
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{post.arrivalTime}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Weight and Price */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Weight className="w-4 h-4 text-orange-600" />
                        <span>{post.availableWeight} kg available</span>
                      </div>
                      <div className="flex items-center space-x-2 font-semibold text-slate-700">
                        <DollarSign className="w-4 h-4" />
                        <span>{post.pricePerKg}/kg</span>
                      </div>
                    </div>

                    {/* Special Notes */}
                    {post.specialNotes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {post.specialNotes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      {status === "authenticated" ? (
                        <Button className="w-full bg-slate-700 hover:bg-slate-800">
                          Contact Traveller
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => router.push("/auth/login")}
                          className="w-full bg-slate-700 hover:bg-slate-800"
                        >
                          Sign In to Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No traveller posts found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(v => v) 
                ? "Try adjusting your search filters"
                : "Be the first to create a traveller post!"
              }
            </p>
            {status === "authenticated" && (
              <Link href="/posts/traveller/new">
                <Button className="bg-slate-700 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TravellerPostsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">Loading...</div>}>
      <TravellerPostsContent />
    </Suspense>
  )
}