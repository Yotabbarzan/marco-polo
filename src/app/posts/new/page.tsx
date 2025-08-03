"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  Plane,
  Package,
  ArrowRight
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function CreatePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/login")
  }, [session, status, router])

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
              <h1 className="text-lg font-semibold text-gray-900">Create New Post</h1>
              <p className="text-sm text-gray-600">What would you like to do?</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Action</h2>
            <p className="text-gray-600">Select what you&apos;d like to do to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traveller Option */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <Link href="/posts/traveller/new" className="block">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I&apos;m Traveling</h3>
                  <p className="text-gray-600 mb-4">
                    I have space in my luggage and can carry items for others
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <span>Create Travel Post</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </Card>

            {/* Sender Option */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200">
              <Link href="/posts/sender/new" className="block">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I Need to Send</h3>
                  <p className="text-gray-600 mb-4">
                    I have items that need to be delivered to another location
                  </p>
                  <div className="flex items-center justify-center text-purple-600 font-medium">
                    <span>Create Item Post</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </Card>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Not sure which one to choose? 
              <span className="block mt-1">
                <strong>Travelers</strong> offer luggage space • <strong>Senders</strong> need items delivered
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}