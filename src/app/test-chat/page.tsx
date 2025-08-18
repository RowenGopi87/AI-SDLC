// Test page for RAG Chat Assistant
export default function TestChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">RAG Chat Assistant Test</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🤖 Chat Assistant Features</h2>
            <p className="text-gray-600 mb-4">
              The Aura Assistant is integrated into the right panel. Click the Bot icon in the header to open it.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Integrated assistant panel</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Context-aware responses</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Work item integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>SAFe framework awareness</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Document upload capability</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🧪 Test Queries</h2>
            <p className="text-gray-600 mb-4">Try asking these questions to test different response types:</p>
            
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <code>What can you help me with?</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code>What is the status of my user authentication feature?</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code>How do I implement SAFe framework in my project?</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code>What testing strategies should I use?</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code>Help me with design architecture</code>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">💡 Enhancement Options</h2>
            <p className="text-blue-700 mb-4">
              To enable full RAG functionality with document context retrieval:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Add your OpenAI API key to the <code className="bg-white px-2 py-1 rounded">.env</code> file</li>
              <li>Set <code className="bg-white px-2 py-1 rounded">AURA_EMBEDDING_PROVIDER=openai</code></li>
              <li>Set <code className="bg-white px-2 py-1 rounded">AURA_EMBEDDING_API_KEY=your_key</code></li>
              <li>Upload SAFe documentation for framework-aware responses</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
