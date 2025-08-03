"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Search, 
  Settings, 
  User, 
  Home, 
  Plus, 
  MessageCircle,
  Star,
  MapPin,
  Package
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
  type: 'traveller'
}

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
  type: 'sender'
}

type FeedPost = TravellerPost | SenderPost

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/login")
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchFeedPosts()
    }
  }, [session])

  const fetchFeedPosts = async () => {
    try {
      setLoading(true)
      
      // Fetch both traveller and sender posts
      const [travellerResponse, senderResponse] = await Promise.all([
        fetch('/api/posts/traveller?limit=10'),
        fetch('/api/posts/sender?limit=10')
      ])

      if (travellerResponse.ok && senderResponse.ok) {
        const travellerData = await travellerResponse.json()
        const senderData = await senderResponse.json()

        // Add type to distinguish posts and combine
        const travellerPosts = travellerData.posts.map((post: TravellerPost) => ({ ...post, type: 'traveller' }))
        const senderPosts = senderData.posts.map((post: SenderPost) => ({ ...post, type: 'sender' }))

        // Combine and sort by creation date
        const combinedPosts = [...travellerPosts, ...senderPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setPosts(combinedPosts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    return timeString.slice(0, 5) // Format HH:MM
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Canada': '🇨🇦',
      'Iran': '🇮🇷',
      'United States': '🇺🇸',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'United Kingdom': '🇬🇧',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺'
    }
    return flags[country] || '🌍'
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-blue-600 font-medium">A</span>
              </div>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="w-full bg-gray-100 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
              </div>
            </div>

            <Search className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading posts...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={`${post.type}-${post.id}`} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4">
                  {post.type === 'traveller' ? (
                    // Traveller Post Card
                    <div className="space-y-4">
                      {/* Departure/Arrival Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getCountryFlag((post as TravellerPost).departureCountry)}</span>
                            <span className="font-medium text-sm">Departure</span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {(post as TravellerPost).departureCity}, {(post as TravellerPost).departureCountry}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate((post as TravellerPost).departureDate)}
                            {(post as TravellerPost).departureTime && `, ${formatTime((post as TravellerPost).departureTime)}`}
                          </p>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getCountryFlag((post as TravellerPost).arrivalCountry)}</span>
                            <span className="font-medium text-sm">Arrival</span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {(post as TravellerPost).arrivalCity}, {(post as TravellerPost).arrivalCountry}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate((post as TravellerPost).arrivalDate)}
                            {(post as TravellerPost).arrivalTime && `, ${formatTime((post as TravellerPost).arrivalTime)}`}
                          </p>
                        </div>
                      </div>

                      {/* Capacity and Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Capacity:</p>
                          <p className="font-semibold">{(post as TravellerPost).availableWeight} KG</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Price:</p>
                          <p className="font-semibold">{(post as TravellerPost).pricePerKg}$/KG</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Item Preference:</p>
                          <p className="font-semibold">None</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {(post as TravellerPost).specialNotes && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Note:</p>
                          <p className="text-sm">{(post as TravellerPost).specialNotes}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivery:</p>
                        <p className="text-sm">No</p>
                      </div>
                    </div>
                  ) : (
                    // Sender Post Card
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        {/* Item Image */}
                        <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-300 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-600" />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-600">Description:</p>
                            <p className="font-semibold">{(post as SenderPost).itemDescription}</p>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-600">Weight:</p>
                            <p className="font-semibold">{(post as SenderPost).weight} KG</p>
                          </div>

                          {(post as SenderPost).specialNotes && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-600">Note:</p>
                              <p className="text-sm">{(post as SenderPost).specialNotes}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-600">Delivery:</p>
                            <p className="text-sm">{(post as SenderPost).deliveryNotes || 'I deliver it myself'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
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
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {post.user.name} {post.user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            post.user.rating && star <= post.user.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button className="p-3 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-3 rounded-lg">
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>
            <button className="p-3 rounded-lg bg-blue-100">
              <Home className="w-6 h-6 text-blue-600" />
            </button>
            <Link href="/posts/sender/new" className="p-3 rounded-lg">
              <Plus className="w-6 h-6 text-gray-600" />
            </Link>
            <button className="p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}