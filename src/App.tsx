/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Activity, Code2, Server } from 'lucide-react';
import TerraformView from './components/TerraformView';
import StressTestView from './components/StressTestView';
import MetricsView from './components/MetricsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'terraform' | 'stress' | 'metrics'>('terraform');

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-lg font-semibold text-white tracking-tight">RDS Proxy Stress Tester</h1>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <a href="https://aws.amazon.com/rds/proxy/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 mb-8 pb-px">
          <button
            onClick={() => setActiveTab('terraform')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'terraform' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            1. Infrastructure (Terraform)
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stress' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            2. Stress Test
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'metrics' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            3. CloudWatch Metrics
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'terraform' && <TerraformView />}
          {activeTab === 'stress' && <StressTestView />}
          {activeTab === 'metrics' && <MetricsView />}
        </div>
      </main>
    </div>
  );
}
