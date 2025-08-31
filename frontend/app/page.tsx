import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="text-6xl mb-6">✈️</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Scenic Seat
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find the perfect window seat for your flight based on solar position and route analysis
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center text-gray-700">
            <span className="mr-2">🌅</span>
            <span>Sunrise and sunset optimization</span>
          </div>
          <div className="flex items-center justify-center text-gray-700">
            <span className="mr-2">🧭</span>
            <span>Great-circle route calculations</span>
          </div>
          <div className="flex items-center justify-center text-gray-700">
            <span className="mr-2">📊</span>
            <span>Confidence and stability analysis</span>
          </div>
        </div>

        <Link 
          href="/tool"
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span className="mr-2">🚀</span>
          Get Started
        </Link>

        <div className="mt-12 text-sm text-gray-500">
          <p>Powered by astronomical calculations and real-time solar positioning</p>
        </div>
      </div>
    </main>
  )
}
