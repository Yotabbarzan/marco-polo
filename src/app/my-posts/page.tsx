"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  Plane,
  Package,
  Weight,
  DollarSign,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TravellerPostForm } from "@/components/forms/traveller-post-form"
import { SenderPostForm } from "@/components/forms/sender-post-form"

interface TravellerPost {
  id: string
  departureCountry: string
  departureCity?: string
  departureDate: string
  departureTime?: string
  arrivalCountry: string
  arrivalCity?: string
  arrivalDate: string
  availableWeight: number
  pricePerKg: number
  status: string
  createdAt: string
}

interface SenderPost {
  id: string
  originCountry: string
  originCity: string
  destinationCountry: string
  destinationCity: string
  itemDescription: string
  weight: number
  maxPrice?: number
  status: string
  createdAt: string
}

export default function MyPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [travellerPosts, setTravellerPosts] = useState<TravellerPost[]>([])
  const [senderPosts, setSenderPosts] = useState<SenderPost[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createType, setCreateType] = useState<'traveller' | 'sender' | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/login")
    else {
      fetchUserPosts()
    }
  }, [session, status, router])

  const fetchUserPosts = async () => {
    if (!session) return
    
    try {
      setLoading(true)
      const userId = (session.user as { id: string }).id
      
      const [travellerResponse, senderResponse] = await Promise.all([
        fetch(`/api/posts/traveller?userId=${userId}&limit=50`),
        fetch(`/api/posts/sender?userId=${userId}&limit=50`)
      ])

      if (travellerResponse.ok) {
        const travellerData = await travellerResponse.json()
        setTravellerPosts(travellerData.posts)
      }

      if (senderResponse.ok) {
        const senderData = await senderResponse.json()
        setSenderPosts(senderData.posts)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
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
    }
    return flags[country] || '🌍'
  }

  const handleCreateClick = (type: 'traveller' | 'sender') => {
    setCreateType(type)
    setCreateModalOpen(true)
  }

  const handleCreateComplete = () => {
    setCreateModalOpen(false)
    setCreateType(null)
    fetchUserPosts() // Refresh the posts
  }

  const handleTravellerSubmit = async (data: {
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
  }) => {
    setFormLoading(true)
    try {
      const response = await fetch("/api/posts/traveller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        handleCreateComplete()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create post")
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleSenderSubmit = async (data: {
    originCountry: string
    originCity: string
    originAddress?: string
    destinationCountry: string
    destinationCity: string
    destinationAddress?: string
    itemCategory: string
    itemDescription: string
    weight: number
    specialNotes?: string
    pickupNotes?: string
    deliveryNotes?: string
  }) => {
    setFormLoading(true)
    try {
      const response = await fetch("/api/posts/sender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        handleCreateComplete()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create post")
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setCreateModalOpen(false)
    setCreateType(null)
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
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Your postings</h1>
              <p className="text-sm text-gray-600">Manage your travel and item posts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading your posts...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Posts List */}
            <div className="space-y-3">
              {/* Traveller Posts */}
              {travellerPosts.map((post) => (
                <Card key={`traveller-${post.id}`} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCountryFlag(post.departureCountry)}</span>
                        <span className="font-medium">
                          {post.departureCity} - {post.arrivalCity}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({formatDate(post.departureDate)}, {formatTime(post.departureTime)})
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Weight className="w-4 h-4" />
                          <span>{post.availableWeight} KG</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${post.pricePerKg}/KG</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Sender Posts */}
              {senderPosts.map((post) => (
                <Card key={`sender-${post.id}`} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCountryFlag(post.originCountry)}</span>
                        <span className="font-medium">
                          {post.originCity} - {post.destinationCity}
                        </span>
                        <span className="text-sm text-gray-600">{post.itemDescription}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Weight className="w-4 h-4" />
                          <span>{post.weight} KG</span>
                        </span>
                        {post.maxPrice && (
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>Max ${post.maxPrice}</span>
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State */}
              {travellerPosts.length === 0 && senderPosts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">Create your first post to get started</p>
                </div>
              )}
            </div>

            {/* Create New Post Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create a new post</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleCreateClick('traveller')}
                  className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-3"
                >
                  <Plane className="w-6 h-6" />
                  <span>Traveller</span>
                </Button>
                <Button
                  onClick={() => handleCreateClick('sender')}
                  className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-3"
                >
                  <Package className="w-6 h-6" />
                  <span>Sender</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Create {createType === 'traveller' ? 'Travel' : 'Item'} Post</span>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {createType === 'traveller' ? (
              <TravellerPostForm
                onSubmit={handleTravellerSubmit}
                onCancel={handleFormCancel}
                isLoading={formLoading}
              />
            ) : createType === 'sender' ? (
              <SenderPostForm
                onSubmit={handleSenderSubmit}
                onCancel={handleFormCancel}
                isLoading={formLoading}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}