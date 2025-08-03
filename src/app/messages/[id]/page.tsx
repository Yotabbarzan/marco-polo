"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft,
  User,
  Package,
  Plane,
  Send,
  Check,
  X,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  content: string
  messageType: 'TEXT' | 'SYSTEM' | 'STATUS_UPDATE'
  createdAt: string
  senderId: string
  sender: {
    id: string
    name?: string
    lastName?: string
    image?: string
  }
}

interface ConversationDetails {
  id: string
  createdAt: string
  updatedAt: string
  otherParticipant: {
    id: string
    name?: string
    lastName?: string
    image?: string
    rating?: number
  } | null
  request: {
    id: string
    status: string
    proposedPrice?: number
    agreedPrice?: number
    senderPost: {
      id: string
      itemDescription: string
      originCountry: string
      originCity: string
      destinationCountry: string
      destinationCity: string
      weight: number
      user: {
        id: string
        name?: string
        lastName?: string
        image?: string
        rating?: number
      }
    }
    travellerPost: {
      id: string
      departureCountry: string
      departureCity: string
      arrivalCountry: string
      arrivalCity: string
      departureDate: string
      availableWeight: number
      user: {
        id: string
        name?: string
        lastName?: string
        image?: string
        rating?: number
      }
    }
    sender: {
      id: string
      name?: string
      lastName?: string
      image?: string
      rating?: number
    }
    receiver: {
      id: string
      name?: string
      lastName?: string
      image?: string
      rating?: number
    }
  }
}

interface ConversationPageProps {
  params: Promise<{ id: string }>
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversationId, setConversationId] = useState<string>("")
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setConversationId(id)
    })
  }, [params])

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/login")
  }, [session, status, router])

  useEffect(() => {
    if (session && conversationId) {
      fetchConversation()
      fetchMessages()
    }
  }, [session, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      
      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation)
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
          messageType: 'TEXT'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.data])
        setNewMessage("")
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleRequestStatusUpdate = async (status: 'ACCEPTED' | 'REJECTED', agreedPrice?: number) => {
    if (!conversation) return

    try {
      const response = await fetch(`/api/requests/${conversation.request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...(agreedPrice && { agreedPrice })
        }),
      })

      if (response.ok) {
        // Refresh conversation and messages
        await Promise.all([fetchConversation(), fetchMessages()])
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update request')
      }
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Failed to update request')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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

  const canUpdateRequest = () => {
    if (!conversation || !session) return false
    
    const isReceiver = conversation.request.receiver.id === (session.user as { id: string }).id
    const isPending = conversation.request.status === 'PENDING'
    
    return isReceiver && isPending
  }

  if (status === "loading" || !conversationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !conversation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            {/* Other participant info */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {conversation.otherParticipant?.image ? (
                  <Image
                    src={conversation.otherParticipant.image}
                    alt={`${conversation.otherParticipant.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {conversation.otherParticipant?.name} {conversation.otherParticipant?.lastName}
                </h1>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        conversation.otherParticipant?.rating && star <= conversation.otherParticipant.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {conversation.otherParticipant?.rating || 'No rating'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Request Summary */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-500" />
                <span className="font-medium">{conversation.request.senderPost.itemDescription}</span>
                <span className="text-sm text-gray-600">({conversation.request.senderPost.weight}kg)</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  {getCountryFlag(conversation.request.travellerPost.departureCountry)} {conversation.request.travellerPost.departureCity} → {getCountryFlag(conversation.request.travellerPost.arrivalCountry)} {conversation.request.travellerPost.arrivalCity}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                conversation.request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                conversation.request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                conversation.request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                conversation.request.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {conversation.request.status}
              </span>
              
              {conversation.request.proposedPrice && (
                <span className="text-sm text-gray-600">
                  ${conversation.request.proposedPrice}
                </span>
              )}
            </div>
          </div>

          {/* Request action buttons */}
          {canUpdateRequest() && (
            <div className="mt-4 flex space-x-3">
              <Button
                onClick={() => handleRequestStatusUpdate('ACCEPTED', conversation.request.proposedPrice)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept Request
              </Button>
              <Button
                onClick={() => handleRequestStatusUpdate('REJECTED')}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Decline Request
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading messages...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === (session.user as { id: string }).id
                const isSystemMessage = message.messageType === 'SYSTEM'
                
                if (isSystemMessage) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-gray-100 px-4 py-2 rounded-full">
                        <p className="text-sm text-gray-600 text-center italic">
                          {message.content}
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}