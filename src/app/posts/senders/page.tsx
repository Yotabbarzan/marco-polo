"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import type { City } from "@/lib/cities"
import type { ApiCity } from "@/lib/api-cities"
import { 
  Package, 
  MapPin, 
  Weight, 
  DollarSign, 
  Star, 
  Search,
  Plus,
  Filter,
  ArrowLeft,
  User
} from "lucide-react"

interface SenderPost {
  id: string
  originCountry: string
  originCity: string
  originAddress?: string
  destinationCountry: string
  destinationCity: string
  destinationAddress?: string
  itemCategory: string
  itemDescription: string
  weight: number
  photos: string[]
  specialNotes?: string
  pickupNotes?: string
  deliveryNotes?: string
  maxPrice?: number
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
  posts: SenderPost[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const ITEM_CATEGORIES = [
  "All Categories",
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

function SenderPostsContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [posts, setPosts] = useState<SenderPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const [filters, setFilters] = useState({
    originCountry: "",
    destinationCountry: "",
    itemCategory: "",
    minWeight: "",
    maxWeight: "",
    minPrice: "",
    maxPrice: "",
  })
  
  // City autocomplete inputs
  const [originCityInput, setOriginCityInput] = useState("")
  const [destinationCityInput, setDestinationCityInput] = useState("")

  const successMessage = searchParams.get('message')

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filters.originCountry && { originCountry: filters.originCountry }),
        ...(filters.destinationCountry && { destinationCountry: filters.destinationCountry }),
        ...(filters.itemCategory && filters.itemCategory !== "All Categories" && { itemCategory: filters.itemCategory }),
        ...(filters.minWeight && { minWeight: filters.minWeight }),
        ...(filters.maxWeight && { maxWeight: filters.maxWeight }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      })

      const response = await fetch(`/api/posts/sender?${params}`)
      
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
      setError("Failed to load sender posts")
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

  const handleOriginCitySelect = (city: City | ApiCity) => {
    setFilters(prev => ({ ...prev, originCountry: city.country }))
    setOriginCityInput(city.name)
  }

  const handleDestinationCitySelect = (city: City | ApiCity) => {
    setFilters(prev => ({ ...prev, destinationCountry: city.country }))
    setDestinationCityInput(city.name)
  }

  const handleSearch = () => {
    fetchPosts(1)
  }

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage)
  }

  const formatLocation = (country: string, city?: string, address?: string) => {
    const parts = [city, country].filter(Boolean)
    if (address) {
      parts.push(`(${address})`)
    }
    return parts.join(', ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
                <h1 className="text-xl font-semibold text-gray-900">Sender Requests</h1>
                <p className="text-sm text-gray-600">Items that need to be delivered</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {status === "authenticated" && (
                <Link href="/posts/sender/new">
                  <Button className="bg-slate-700 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Send Item
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CityAutocomplete
                label="Origin City"
                placeholder="Search origin city..."
                value={originCityInput}
                onCitySelect={handleOriginCitySelect}
                onInputChange={setOriginCityInput}
                id="originCity"
              />
              
              <CityAutocomplete
                label="Destination City"
                placeholder="Search destination city..."
                value={destinationCityInput}
                onCitySelect={handleDestinationCitySelect}
                onInputChange={setDestinationCityInput}
                id="destinationCity"
              />
              
              <div className="space-y-2">
                <Label htmlFor="itemCategory">Category</Label>
                <Select value={filters.itemCategory} onValueChange={(value) => handleFilterChange("itemCategory", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
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
                <Label htmlFor="minWeight">Min Weight (kg)</Label>
                <Input
                  id="minWeight"
                  type="number"
                  step="0.1"
                  placeholder="Min weight"
                  value={filters.minWeight}
                  onChange={(e) => handleFilterChange("minWeight", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  step="0.1"
                  placeholder="Max weight"
                  value={filters.maxWeight}
                  onChange={(e) => handleFilterChange("maxWeight", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price (USD)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Maximum price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
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
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {post.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Item Category and Weight */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {post.itemCategory}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Weight className="w-4 h-4" />
                        <span>{post.weight} kg</span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">From:</span>
                        <span>{formatLocation(post.originCountry, post.originCity, post.originAddress)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="font-medium">To:</span>
                        <span>{formatLocation(post.destinationCountry, post.destinationCity, post.destinationAddress)}</span>
                      </div>
                    </div>

                    {/* Item Description */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {post.itemDescription}
                      </p>
                    </div>

                    {/* Price */}
                    {post.maxPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Willing to pay up to:</span>
                        <div className="flex items-center space-x-1 font-semibold text-slate-700">
                          <DollarSign className="w-4 h-4" />
                          <span>{post.maxPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Creation Date */}
                    <div className="text-xs text-gray-500">
                      Posted: {formatDate(post.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      {status === "authenticated" ? (
                        <Button className="w-full bg-slate-700 hover:bg-slate-800">
                          Contact Sender
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
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sender requests found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(v => v) 
                ? "Try adjusting your search filters"
                : "Be the first to create a sender request!"
              }
            </p>
            {status === "authenticated" && (
              <Link href="/posts/sender/new">
                <Button className="bg-slate-700 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Send First Item
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SenderPostsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">Loading...</div>}>
      <SenderPostsContent />
    </Suspense>
  )
}