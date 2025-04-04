import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-8">
      <section className="rounded-lg bg-gradient-to-b from-[#14131B] to-[#10101F] p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Solana AI Agent Dashboard</h1>
        <p className="text-xl text-gray-300 mb-6">
          Build, deploy, and monitor intelligent trading agents on Solana
        </p>
        <div className="flex space-x-4">
          <Link href="/auto-trading">
            <a className="rounded-lg bg-[#FF5A5F] px-4 py-2 font-medium text-white hover:bg-opacity-90 transition-all">
              Start Auto-Trading
            </a>
          </Link>
          <Link href="/ai-agent-builder">
            <a className="rounded-lg border border-[#3A86FF] px-4 py-2 font-medium text-[#3A86FF] hover:bg-[#3A86FF] hover:bg-opacity-10 transition-all">
              Build AI Agent
            </a>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black bg-opacity-70 p-6 rounded-lg">
          <div className="mb-4 text-[#3A86FF]">
            <i className="ri-robot-line text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">AI Agent Builder</h2>
          <p className="text-gray-300">Create custom trading agents using our visual node-based workflow builder.</p>
        </div>
        
        <div className="bg-black bg-opacity-70 p-6 rounded-lg">
          <div className="mb-4 text-[#FF5A5F]">
            <i className="ri-line-chart-line text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Auto Trading</h2>
          <p className="text-gray-300">Simulate and automate trading with our specialized memecoin trading bot.</p>
        </div>
        
        <div className="bg-black bg-opacity-70 p-6 rounded-lg">
          <div className="mb-4 text-[#00FFD1]">
            <i className="ri-coin-line text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Token Creator</h2>
          <p className="text-gray-300">Launch your own Solana token with customizable parameters and features.</p>
        </div>
      </div>
    </div>
  );
}