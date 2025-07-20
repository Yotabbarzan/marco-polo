'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, Plane, Package, MapPin, Calendar, DollarSign, Star, MessageCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sender' | 'carrier'>('sender');
  const [currentStep, setCurrentStep] = useState(1);
  const [demoData, setDemoData] = useState({
    from: '',
    to: '',
    item: '',
    weight: '',
    price: '',
    date: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setDemoData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setDemoData({ from: '', to: '', item: '', weight: '', price: '', date: '' });
  };

  const mockCarriers = [
    { id: 1, name: 'Sarah Chen', rating: 4.9, trips: 23, route: 'NYC → London', date: '2025-08-15', price: '$25/kg', avatar: '👩‍💼' },
    { id: 2, name: 'Mike Rodriguez', rating: 4.8, trips: 15, route: 'NYC → London', date: '2025-08-16', price: '$22/kg', avatar: '👨‍💼' },
    { id: 3, name: 'Emma Wilson', rating: 5.0, trips: 31, route: 'NYC → London', date: '2025-08-18', price: '$30/kg', avatar: '👩‍🎓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/marcopolo-360-logo.png"
                alt="Marcopolo 360 Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
              <h1 className="text-sm font-medium text-gray-700">Marcopolo 360</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-slate-600">How it works</a>
              <a href="#" className="text-gray-600 hover:text-slate-600">Safety</a>
              <a href="/auth/login" className="text-gray-600 hover:text-slate-600">Sign In</a>
              <a href="/auth/register" className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Share luggage space, save money, connect globally
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Send items worldwide through travelers or earn money by carrying for others
          </p>
          
          {/* Tab Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => { setActiveTab('sender'); resetDemo(); }}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'sender' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-slate-600'
                }`}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Send an Item
              </button>
              <button
                onClick={() => { setActiveTab('carrier'); resetDemo(); }}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'carrier' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-slate-600'
                }`}
              >
                <Plane className="w-5 h-5 inline mr-2" />
                Carry & Earn
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-slate-700' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Details</span>
                <span>{activeTab === 'sender' ? 'Browse' : 'Post'}</span>
                <span>Book</span>
                <span>Complete</span>
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Input Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'sender' ? 'What do you need to send?' : 'Where are you traveling?'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="New York, NY"
                          value={demoData.from}
                          onChange={(e) => handleInputChange('from', e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="London, UK"
                          value={demoData.to}
                          onChange={(e) => handleInputChange('to', e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {activeTab === 'sender' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Description</label>
                        <input
                          type="text"
                          placeholder="Documents, gifts, etc."
                          value={demoData.item}
                          onChange={(e) => handleInputChange('item', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                        <input
                          type="text"
                          placeholder="2.5 kg"
                          value={demoData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'sender' ? 'Budget' : 'Rate per kg'}
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder={activeTab === 'sender' ? '$50' : '$25/kg'}
                          value={demoData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'sender' ? 'Needed by' : 'Travel date'}
                      </label>
                      <div className="relative">
                        <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="date"
                          value={demoData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
                  >
                    {activeTab === 'sender' ? 'Find Carriers' : 'Post Trip'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 2: Browse/Results */}
              {currentStep === 2 && activeTab === 'sender' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Available Carriers</h3>
                  <p className="text-gray-600">Found 3 carriers for your route</p>
                  
                  <div className="space-y-4">
                    {mockCarriers.map((carrier) => (
                      <div key={carrier.id} className="border border-gray-200 rounded-lg p-4 hover:border-slate-300 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{carrier.avatar}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{carrier.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span>{carrier.rating}</span>
                                <span>•</span>
                                <span>{carrier.trips} trips</span>
                              </div>
                              <p className="text-sm text-gray-600">{carrier.route}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-lg text-gray-900">{carrier.price}</p>
                            <p className="text-sm text-gray-600">{carrier.date}</p>
                            <button 
                              onClick={nextStep}
                              className="mt-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && activeTab === 'carrier' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Trip Posted Successfully!</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-green-800 font-medium">Your trip is now live</h4>
                        <p className="text-green-700 text-sm">Senders can now find and book space with you</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Trip Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Route:</strong> {demoData.from || 'New York'} → {demoData.to || 'London'}</p>
                      <p><strong>Date:</strong> {demoData.date || 'Aug 15, 2025'}</p>
                      <p><strong>Rate:</strong> {demoData.price || '$25/kg'}</p>
                      <p><strong>Available space:</strong> 15 kg</p>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Continue to Booking Demo
                  </button>
                </div>
              )}

              {/* Step 3: Booking */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'sender' ? 'Confirm Booking' : 'Incoming Booking Request'}
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {activeTab === 'sender' ? '👩‍💼' : '👨‍💻'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {activeTab === 'sender' ? 'Sarah Chen' : 'John Doe wants to send'}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p><strong>Item:</strong> {demoData.item || 'Important documents'}</p>
                          <p><strong>Weight:</strong> {demoData.weight || '2.5 kg'}</p>
                          <p><strong>Route:</strong> {demoData.from || 'New York'} → {demoData.to || 'London'}</p>
                          <p><strong>Total:</strong> ${demoData.price || '62.50'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <button 
                        onClick={nextStep}
                        className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-800"
                      >
                        {activeTab === 'sender' ? 'Confirm & Pay' : 'Accept Request'}
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl text-green-600">🎉</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'sender' ? 'Booking Confirmed!' : 'Request Accepted!'}
                  </h3>
                  
                  <p className="text-gray-600">
                    {activeTab === 'sender' 
                      ? 'Your item will be picked up tomorrow. You\'ll receive tracking updates throughout the journey.'
                      : 'You\'ve earned $62.50! Coordinate pickup details with the sender.'}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activeTab === 'sender' ? (
                        <>
                          <li>• Receive pickup instructions via SMS</li>
                          <li>• Track your item in real-time</li>
                          <li>• Rate your carrier after delivery</li>
                        </>
                      ) : (
                        <>
                          <li>• Contact sender to arrange pickup</li>
                          <li>• Verify item before departure</li>
                          <li>• Complete delivery and get paid</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <button
                    onClick={resetDemo}
                    className="bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Marco Polo?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-slate-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Trusted Community</h4>
              <p className="text-gray-600">Verified users with ratings and reviews ensure safe, reliable deliveries</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Save Money</h4>
              <p className="text-gray-600">Up to 70% cheaper than traditional shipping services</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plane className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Global Network</h4>
              <p className="text-gray-600">Connect with travelers going to 190+ countries worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/marcopolo-360-logo.png"
              alt="Marcopolo 360 Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <h1 className="text-base font-medium">Marcopolo 360</h1>
          </div>
          <p className="text-gray-400 mb-4">Connecting travelers and senders worldwide</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
