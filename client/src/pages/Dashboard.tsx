import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import OverviewCard from "@/components/dashboard/OverviewCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { useWallet } from "@/lib/walletAdapter";
import { useLocation } from "wouter";
import { subscribeTradingState, getTradingState } from "@/lib/tradingState";
import { formatCurrency, formatPercentage } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const { wallet } = useWallet();
  const [location, setLocation] = useLocation();
  const [tradingPerformance, setTradingPerformance] = useState({
    portfolioValue: "$0",
    change: "0%",
    description: "Connect wallet to start trading",
    activeBots: 0,
  });

  // Subscribe to trading state changes
  useEffect(() => {
    // Initialize with current state in case there's already data
    const currentState = getTradingState();
    if (
      currentState.currentValue > 0 &&
      currentState.currentValue !== currentState.startingCapital
    ) {
      updateDashboardState(currentState);
    }

    // Subscribe to future updates
    const unsubscribe = subscribeTradingState((state) => {
      updateDashboardState(state);
    });

    return unsubscribe;
  }, []);

  // Helper function to update dashboard
  const updateDashboardState = (state: any) => {
    // Always update with trading state
    const portfolioValue = formatCurrency(state.currentValue);
    const change = formatPercentage(state.profitLossPercentage);
    const description = state.isActive
      ? "Trading in progress"
      : `Profit/Loss: ${state.profitLoss >= 0 ? "+" : ""}${formatCurrency(state.profitLoss)}`;
    const activeBots = state.isActive ? 1 : 0;

    setTradingPerformance({
      portfolioValue,
      change: state.profitLossPercentage >= 0 ? `+${change}` : change,
      description,
      activeBots,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header title="Dashboard" wallet={wallet} />

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <OverviewCard
          title="Portfolio Value"
          value={tradingPerformance.portfolioValue}
          change={tradingPerformance.change}
          description={tradingPerformance.description}
          icon="ri-bar-chart-line"
          iconColor="bg-brutalism-blue"
        />

        <OverviewCard
          title="Active Bots"
          value={String(tradingPerformance.activeBots)}
          icon="ri-robot-line"
          iconColor="bg-brutalism-yellow"
          action={{
            label:
              tradingPerformance.activeBots > 0
                ? "Manage Bots"
                : "Start Trading Bot",
            onClick: () => setLocation("/auto-trading"),
          }}
        />

        <OverviewCard
          title="AI Agents"
          value="0"
          icon="ri-brain-line"
          iconColor="bg-brutalism-purple"
          action={{
            label: "Create New Agent",
            onClick: () => setLocation("/ai-agent-builder"),
            color: "purple",
          }}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="mb-8">
        <PerformanceChart title="Performance Overview" />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-mono font-bold mb-4">Recent Activity</h2>
        <div className="brutalist-card p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-brutalism-green flex items-center justify-center mr-4 border-2 border-black">
                  <i className="ri-robot-line text-white"></i>
                </div>
                <div>
                  <p className="font-bold">Trading Bot Started</p>
                  <p className="text-sm text-gray-400">Medium Risk Strategy</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">10 minutes ago</p>
            </div>

            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-brutalism-blue flex items-center justify-center mr-4 border-2 border-black">
                  <i className="ri-coin-line text-white"></i>
                </div>
                <div>
                  <p className="font-bold">Wallet Connected</p>
                  <p className="text-sm text-gray-400">via Phantom</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">25 minutes ago</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-brutalism-purple flex items-center justify-center mr-4 border-2 border-black">
                  <i className="ri-flow-chart text-white"></i>
                </div>
                <div>
                  <p className="font-bold">AI Agent Created</p>
                  <p className="text-sm text-gray-400">Market Analyzer Agent</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
