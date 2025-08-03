"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Package, Plane } from "lucide-react"

interface TravellerPost {
  id: string
  departureCountry: string
  departureCity?: string
  arrivalCountry: string
  arrivalCity?: string
  departureDate: string
  arrivalDate: string
  availableWeight: number
  pricePerKg: number
  user: {
    id: string
    name?: string
    lastName?: string
  }
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
  user: {
    id: string
    name?: string
    lastName?: string
  }
}

interface UserPost {
  id: string
  type: 'traveller' | 'sender'
  data: TravellerPost | SenderPost
}

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetPost: {
    id: string
    type: 'traveller' | 'sender'
    data: TravellerPost | SenderPost
  } | null
  onRequestCreated: () => void
}

export function RequestModal({ isOpen, onClose, targetPost, onRequestCreated }: RequestModalProps) {
  const { data: session } = useSession()
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [proposedPrice, setProposedPrice] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchingPosts, setFetchingPosts] = useState(false)

  const fetchUserPosts = useCallback(async () => {
    if (!session || !targetPost) return

    setFetchingPosts(true)
    try {
      // Fetch opposite type posts (if target is traveller, fetch user's sender posts and vice versa)
      const postType = targetPost.type === 'traveller' ? 'sender' : 'traveller'
      const response = await fetch(`/api/posts/${postType}?userId=${(session.user as { id: string }).id}`)
      
      if (response.ok) {
        const data = await response.json()
        const posts = data.posts.map((post: TravellerPost | SenderPost) => ({
          id: post.id,
          type: postType,
          data: post
        }))
        setUserPosts(posts)
        
        // Auto-select if only one post
        if (posts.length === 1) {
          setSelectedPostId(posts[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setFetchingPosts(false)
    }
  }, [session, targetPost])

  useEffect(() => {
    if (isOpen && session && targetPost) {
      fetchUserPosts()
      setMessage("")
      setProposedPrice("")
      setSelectedPostId("")
    }
  }, [isOpen, session, targetPost, fetchUserPosts])

  const handleSubmit = async () => {
    if (!selectedPostId || !targetPost || !session) return

    setLoading(true)
    try {
      const requestData = {
        senderPostId: targetPost.type === 'sender' ? targetPost.id : selectedPostId,
        travellerPostId: targetPost.type === 'traveller' ? targetPost.id : selectedPostId,
        message: message.trim() || undefined,
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : undefined,
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        onRequestCreated()
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create request')
      }
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Failed to create request')
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

  if (!targetPost) return null

  const oppositeType = targetPost.type === 'traveller' ? 'sender' : 'traveller'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Create Request</span>
            <button
              onClick={onClose}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Post Display */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {targetPost.type === 'traveller' ? 'Traveller Offering Space' : 'Sender Needing Transport'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {targetPost.type === 'traveller' ? (
                <div className="flex items-center space-x-4">
                  <Plane className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">
                      {getCountryFlag((targetPost.data as TravellerPost).departureCountry)} {(targetPost.data as TravellerPost).departureCity} → {getCountryFlag((targetPost.data as TravellerPost).arrivalCountry)} {(targetPost.data as TravellerPost).arrivalCity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate((targetPost.data as TravellerPost).departureDate)} • {(targetPost.data as TravellerPost).availableWeight}kg available • ${(targetPost.data as TravellerPost).pricePerKg}/kg
                    </p>
                    <p className="text-sm text-gray-800">
                      by {(targetPost.data as TravellerPost).user.name} {(targetPost.data as TravellerPost).user.lastName}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Package className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="font-medium">{(targetPost.data as SenderPost).itemDescription}</p>
                    <p className="text-sm text-gray-600">
                      {getCountryFlag((targetPost.data as SenderPost).originCountry)} {(targetPost.data as SenderPost).originCity} → {getCountryFlag((targetPost.data as SenderPost).destinationCountry)} {(targetPost.data as SenderPost).destinationCity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(targetPost.data as SenderPost).weight}kg • {(targetPost.data as SenderPost).maxPrice ? `Max $${(targetPost.data as SenderPost).maxPrice}` : 'Price negotiable'}
                    </p>
                    <p className="text-sm text-gray-800">
                      by {(targetPost.data as SenderPost).user.name} {(targetPost.data as SenderPost).user.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User's Posts Selection */}
          <div>
            <Label className="text-base font-medium">
              Select your {oppositeType === 'traveller' ? 'trip' : 'item'} to connect:
            </Label>
            {fetchingPosts ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-600">Loading your posts...</div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                <p>You don&apos;t have any {oppositeType} posts yet.</p>
                <p className="text-sm mt-1">
                  Create a {oppositeType} post first to send requests.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {userPosts.map((userPost) => (
                  <div
                    key={userPost.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPostId === userPost.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPostId(userPost.id)}
                  >
                    {userPost.type === 'traveller' ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={selectedPostId === userPost.id}
                          onChange={() => setSelectedPostId(userPost.id)}
                          className="text-blue-600"
                        />
                        <Plane className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {getCountryFlag((userPost.data as TravellerPost).departureCountry)} {(userPost.data as TravellerPost).departureCity} → {getCountryFlag((userPost.data as TravellerPost).arrivalCountry)} {(userPost.data as TravellerPost).arrivalCity}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate((userPost.data as TravellerPost).departureDate)} • {(userPost.data as TravellerPost).availableWeight}kg available
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={selectedPostId === userPost.id}
                          onChange={() => setSelectedPostId(userPost.id)}
                          className="text-blue-600"
                        />
                        <Package className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-sm">{(userPost.data as SenderPost).itemDescription}</p>
                          <p className="text-xs text-gray-600">
                            {getCountryFlag((userPost.data as SenderPost).originCountry)} {(userPost.data as SenderPost).originCity} → {getCountryFlag((userPost.data as SenderPost).destinationCountry)} {(userPost.data as SenderPost).destinationCity} • {(userPost.data as SenderPost).weight}kg
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to introduce yourself..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Proposed Price */}
          {targetPost.type === 'traveller' && (
            <div>
              <Label htmlFor="proposedPrice">Proposed Price (optional)</Label>
              <div className="mt-1 relative">
                <Input
                  id="proposedPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter your price offer"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="pl-6"
                />
                <span className="absolute left-2 top-2.5 text-gray-500">$</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPostId || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}