"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { User, Package, Plane, Settings } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/auth/login") // Redirect if not authenticated
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Link href="/" className="text-slate-600 hover:text-slate-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {session.user?.name || "User"}!
              </h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Items Sent</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Trips Posted</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/posts/sender/new" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-slate-300 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Send an Item</p>
                <p className="text-sm text-gray-600">Find carriers for your packages</p>
              </div>
            </Link>

            <Link href="/posts/traveller/new" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-slate-300 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Post a Trip</p>
                <p className="text-sm text-gray-600">Offer space in your luggage</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Browse Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Marketplace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/posts/travellers" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-slate-300 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Browse Travellers</p>
                <p className="text-sm text-gray-600">Find people offering luggage space</p>
              </div>
            </Link>

            <Link href="/posts/senders" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-slate-300 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Browse Sender Requests</p>
                <p className="text-sm text-gray-600">See items people want to send</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Authentication Status Info */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">✅ Authentication Working!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Session Status:</strong> {status}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p><strong>User ID:</strong> {(session.user as any)?.id || "Not available"}</p>
            <p><strong>Email Verified:</strong> Yes (automatically during registration)</p>
            <p><strong>Login Method:</strong> Email/Password with NextAuth v4</p>
          </div>
        </div>
      </main>
    </div>
  )
}