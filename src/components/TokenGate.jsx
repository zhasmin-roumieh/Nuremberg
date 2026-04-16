export default function TokenGate() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-8 space-y-5">
        <div className="text-center">
          <div className="text-5xl mb-3">🗺️</div>
          <h1 className="text-xl font-bold text-gray-900">Nuremberg Explorer</h1>
          <p className="text-sm text-gray-500 mt-1">One-time setup needed</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">Get your free Foursquare API key</p>
          <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Go to <strong>foursquare.com/developer</strong> and sign up (free)</li>
            <li>Create a new project</li>
            <li>Copy your <strong>API Key</strong></li>
            <li>Create a file called <code className="bg-amber-100 px-1 rounded text-xs">.env</code> in the project folder and add:
              <code className="block mt-1 bg-amber-100 px-2 py-1.5 rounded-lg text-xs break-all">
                VITE_FOURSQUARE_API_KEY=paste_key_here
              </code>
            </li>
            <li>Restart: <code className="bg-amber-100 px-1 rounded text-xs">npm run dev</code></li>
          </ol>
          <p className="text-xs text-amber-600">Free tier: 100,000 calls/month — more than enough.</p>
        </div>
      </div>
    </div>
  )
}
