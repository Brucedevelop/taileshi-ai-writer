import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            泰乐施 AI Writing Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            2026 AI-Powered SEO Blog Content Platform
          </p>
          <p className="text-gray-500">
            Automated research, writing, image generation, and WordPress publishing for B2B exporters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-semibold mb-2">AI Article Writing</h3>
            <p className="text-gray-600 text-sm">
              GPT-4o, Claude, Gemini — Generate SEO-optimized B2B articles with SERP research
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="text-lg font-semibold mb-2">AI Image Generation</h3>
            <p className="text-gray-600 text-sm">
              Recraft.ai professional product illustrations for every article section
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">📤</div>
            <h3 className="text-lg font-semibold mb-2">WordPress Publishing</h3>
            <p className="text-gray-600 text-sm">
              Batch publish to multiple WordPress sites with scheduling support
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border-2 border-blue-500 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">¥10</div>
              <div className="font-semibold mb-2">With AI Images</div>
              <div className="text-sm text-gray-500">Research + Write + Images + Publish</div>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-gray-700 mb-1">¥6</div>
              <div className="font-semibold mb-2">Without Images</div>
              <div className="text-sm text-gray-500">Research + Write + Publish</div>
            </div>
          </div>
        </div>

        <div className="text-center space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
