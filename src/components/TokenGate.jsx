export default function TokenGate() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <div className="text-5xl">🗺️</div>
        <h1 className="text-2xl font-bold text-gray-900">Nuremberg Explorer</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          To display the map you need a <strong>Google Maps API key</strong>.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-amber-800">Quick setup (5 minutes):</p>
          <ol className="text-sm text-amber-700 space-y-1.5 list-decimal list-inside">
            <li>Go to <strong>console.cloud.google.com</strong></li>
            <li>Create a new project (or pick an existing one)</li>
            <li>Go to <strong>APIs & Services → Enable APIs</strong> and enable:
              <ul className="list-disc list-inside ml-3 mt-1 space-y-0.5">
                <li>Maps JavaScript API</li>
                <li>Places API</li>
              </ul>
            </li>
            <li>Go to <strong>Credentials → Create API Key</strong></li>
            <li>Copy the key</li>
            <li>Create a file called <code className="bg-amber-100 px-1 rounded">.env</code> in the project folder and add:
              <code className="bg-amber-100 px-2 py-1 rounded text-xs block mt-1 break-all">
                VITE_GOOGLE_MAPS_API_KEY=paste_your_key_here
              </code>
            </li>
            <li>Restart: <code className="bg-amber-100 px-1 rounded text-xs">npm run dev</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
