"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft,
  User,
  MessageCircle,
  Package,
  Plane,
  Clock
} from "lucide-react"

interface Conversation {
  id: string
  createdAt: string
  updatedAt: string
  otherParticipant: {
    id: string
    name?: string
    lastName?: string
    image?: string
  } | null
  request: {
    id: string
    status: string
    senderPost: {
      id: string
      itemDescription: string
      originCountry: string
      originCity: string
      destinationCountry: string
      destinationCity: string
      weight: number
    }
    travellerPost: {
      id: string
      departureCountry: string
      departureCity: string
      arrivalCountry: string
      arrivalCity: string
      departureDate: string
      availableWeight: number
    }
    sender: {
      id: string
      name?: string
      lastName?: string
      image?: string
    }
    receiver: {
      id: string
      name?: string
      lastName?: string
      image?: string
    }
  }
  latestMessage: {
    id: string
    content: string
    messageType: string
    createdAt: string
    senderId: string
  } | null
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/login")
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/conversations')
      
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
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

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">Your conversations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-6">
              Start conversations by creating requests on posts in the dashboard.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Other participant avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {conversation.otherParticipant?.image ? (
                          <Image
                            src={conversation.otherParticipant.image}
                            alt={`${conversation.otherParticipant.name} avatar`}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Participant name and request status */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.name} {conversation.otherParticipant?.lastName}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(conversation.request.status)}`}>
                          {conversation.request.status}
                        </span>
                      </div>

                      {/* Request summary */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600 truncate">
                          {conversation.request.senderPost?.itemDescription}
                        </span>
                        <span className="text-gray-400">•</span>
                        <Plane className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 truncate">
                          {getCountryFlag(conversation.request.travellerPost?.departureCountry)} {conversation.request.travellerPost?.departureCity} → {getCountryFlag(conversation.request.travellerPost?.arrivalCountry)} {conversation.request.travellerPost?.arrivalCity}
                        </span>
                      </div>

                      {/* Latest message */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.latestMessage ? (
                            conversation.latestMessage.messageType === 'SYSTEM' ? (
                              <span className="italic">{conversation.latestMessage.content}</span>
                            ) : (
                              <>
                                {conversation.latestMessage.senderId === (session.user as { id: string }).id ? 'You: ' : ''}
                                {conversation.latestMessage.content}
                              </>
                            )
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                        <div className="flex items-center space-x-2 ml-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {conversation.latestMessage 
                              ? formatDate(conversation.latestMessage.createdAt)
                              : formatDate(conversation.createdAt)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}