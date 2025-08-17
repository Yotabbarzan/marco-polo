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
  Home as HomeIcon, 
  Plus, 
  MessageCircle,
  Star,
  MapPin,
  Package,
  CheckCircle,
  Menu,
  X
} from "lucide-react"
import { RequestModal } from "@/components/requests/request-modal"

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

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [travellerPosts, setTravellerPosts] = useState<TravellerPost[]>([])
  const [senderPosts, setSenderPosts] = useState<SenderPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'travellers' | 'luggage'>('luggage')
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<{
    id: string
    type: 'traveller' | 'sender'
    data: TravellerPost | SenderPost
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
    
    // Check for success message in URL
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccessMessage(message)
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname)
      // Auto-hide the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [session])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      // Get current user ID to exclude their posts from homepage feed
      const userId = (session?.user as { id: string })?.id
      const userFilter = userId ? `&excludeUser=${userId}` : ''
      
      // Fetch both traveller and sender posts (excluding current user's posts)
      const [travellerResponse, senderResponse] = await Promise.all([
        fetch(`/api/posts/traveller?limit=20${userFilter}`),
        fetch(`/api/posts/sender?limit=20${userFilter}`)
      ])

      if (travellerResponse.ok) {
        const travellerData = await travellerResponse.json()
        setTravellerPosts(travellerData.posts.map((post: TravellerPost) => ({ ...post, type: 'traveller' })))
      }

      if (senderResponse.ok) {
        const senderData = await senderResponse.json()
        setSenderPosts(senderData.posts.map((post: SenderPost) => ({ ...post, type: 'sender' })))
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    return timeString.slice(0, 5)
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

  const handlePostClick = (post: FeedPost) => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setSelectedPost({
      id: post.id,
      type: post.type,
      data: post
    })
    setRequestModalOpen(true)
  }

  const handleRequestCreated = () => {
    fetchPosts()
  }

  const closeRequestModal = () => {
    setRequestModalOpen(false)
    setSelectedPost(null)
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderTravellerCard = (post: TravellerPost) => (
    <div 
      key={`traveller-${post.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handlePostClick(post)}
    >
      {/* Header with route info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {post.departureCity}, {getCountryFlag(post.departureCountry)}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-sm font-medium text-gray-900">
            {post.arrivalCity}, {getCountryFlag(post.arrivalCountry)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(post.departureDate)} - {formatTime(post.departureTime)}
        </span>
      </div>

      <div className="flex space-x-4">
        {/* User info */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {post.user.image ? (
                <Image
                  src={post.user.image}
                  alt={`${post.user.name} avatar`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Post details */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">
              {post.user.name} {post.user.lastName}
            </h3>
            {renderStars(post.user.rating)}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Capacity:</span>
              <div className="font-medium">{post.availableWeight} KG</div>
            </div>
            <div>
              <span className="text-gray-500">Price:</span>
              <div className="font-medium">{post.pricePerKg}$/KG</div>
            </div>
            <div>
              <span className="text-gray-500">Item Preference:</span>
              <div className="font-medium">None</div>
            </div>
          </div>

          {post.specialNotes && (
            <div className="mt-2">
              <span className="text-gray-500 text-sm">Note:</span>
              <p className="text-sm text-gray-700">{post.specialNotes}</p>
            </div>
          )}
          
          <div className="mt-2">
            <span className="text-gray-500 text-sm">Delivery:</span>
            <span className="text-sm text-gray-700 ml-1">No</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSenderCard = (post: SenderPost) => (
    <div 
      key={`sender-${post.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handlePostClick(post)}
    >
      {/* Header with route info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {post.originCity}, {getCountryFlag(post.originCountry)}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-sm font-medium text-gray-900">
            {post.destinationCity}, {getCountryFlag(post.destinationCountry)}
          </span>
        </div>
      </div>

      <div className="flex space-x-4">
        {/* Item image */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-300 rounded-lg flex items-center justify-center flex-shrink-0">
          {post.photos && post.photos.length > 0 ? (
            <Image
              src={post.photos[0]}
              alt={post.itemDescription}
              width={80}
              height={80}
              className="rounded-lg object-cover w-full h-full"
            />
          ) : (
            <Package className="w-8 h-8 text-gray-600" />
          )}
        </div>

        {/* Post details */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">
              {post.user.name} {post.user.lastName}
            </h3>
            {renderStars(post.user.rating)}
          </div>
          
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-500">Description:</span>
              <span className="font-medium ml-1">{post.itemDescription}</span>
            </div>
            <div>
              <span className="text-gray-500">Weight:</span>
              <span className="font-medium ml-1">{post.weight} KG</span>
            </div>
            {post.specialNotes && (
              <div>
                <span className="text-gray-500">Note:</span>
                <span className="text-gray-700 ml-1">{post.specialNotes}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Delivery:</span>
              <span className="text-gray-700 ml-1">{post.deliveryNotes || 'I deliver it myself'}</span>
            </div>
          </div>
        </div>

        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {post.user.image ? (
                <Image
                  src={post.user.image}
                  alt={`${post.user.name} avatar`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop Website Style */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">MP</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Marco Polo</h1>
                    <p className="text-sm text-gray-600">Global Luggage Sharing Platform</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search destinations, routes..."
                    className="w-full bg-gray-100 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {session ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/my-posts" className="text-sm text-gray-600 hover:text-gray-900">
                      My Posts
                    </Link>
                    <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">
                      Messages
                    </Link>
                    <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
                    <Link href="/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Create Post
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Marco Polo</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-gray-600" />
                <Menu className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('travellers')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'travellers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Traveller Listings
              </button>
              <button
                onClick={() => setActiveTab('luggage')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'luggage'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Awaiting Shipments
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <div className="px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('travellers')}
                className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${
                  activeTab === 'travellers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Travellers
              </button>
              <button
                onClick={() => setActiveTab('luggage')}
                className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${
                  activeTab === 'luggage'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Luggage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4 mt-4 md:mx-auto md:max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!session && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Welcome to Marco Polo</h3>
                  <p className="text-blue-700 mb-4">Connect travelers with luggage space to people who need items transported worldwide. Browse posts and discover opportunities.</p>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="text-xl text-gray-600">Loading posts...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeTab === 'travellers' && (
                  <>
                    {travellerPosts.length > 0 ? (
                      travellerPosts.map(renderTravellerCard)
                    ) : (
                      <div className="col-span-full text-center py-16">
                        <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No traveller posts available</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'luggage' && (
                  <>
                    {senderPosts.length > 0 ? (
                      senderPosts.map(renderSenderCard)
                    ) : (
                      <div className="col-span-full text-center py-16">
                        <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No luggage requests available</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden px-4 py-4">
          {!session && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <h3 className="font-medium text-blue-900 mb-1">Welcome to Marco Polo</h3>
                <p className="text-sm text-blue-700 mb-3">Browse posts and discover opportunities. Sign in to create requests and start conversations.</p>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 inline-block"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading posts...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'travellers' && (
                <>
                  {travellerPosts.length > 0 ? (
                    travellerPosts.map(renderTravellerCard)
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No traveller posts available</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'luggage' && (
                <>
                  {senderPosts.length > 0 ? (
                    senderPosts.map(renderSenderCard)
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No luggage requests available</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="px-4">
          <div className="flex items-center justify-around py-2">
            <button className="p-3 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <Link href={session ? "/my-posts" : "/auth/login"} className="p-3 rounded-lg">
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>
            <button className="p-3 rounded-lg bg-blue-100">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </button>
            <Link href={session ? "/posts/new" : "/auth/login"} className="p-3 rounded-lg">
              <Plus className="w-6 h-6 text-gray-600" />
            </Link>
            <Link href={session ? "/messages" : "/auth/login"} className="p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed navigation - Mobile Only */}
      <div className="md:hidden h-20"></div>

      {/* Request Modal */}
      {session && (
        <RequestModal
          isOpen={requestModalOpen}
          onClose={closeRequestModal}
          targetPost={selectedPost}
          onRequestCreated={handleRequestCreated}
        />
      )}
    </div>
  )
}