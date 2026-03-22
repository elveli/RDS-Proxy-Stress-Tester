import React, { useState } from 'react';
import { Play, Square, Activity, Database, Clock, AlertCircle } from 'lucide-react';

export default function StressTestView() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'SuperSecretPassword123!',
    database: 'stresstestdb',
    connections: 50,
    duration: 30,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const startTest = async () => {
    setRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run stress test');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Connection Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Host (Proxy Endpoint or localhost)</label>
              <input
                type="text"
                name="host"
                value={config.host}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="localhost"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Port</label>
                <input
                  type="text"
                  name="port"
                  value={config.port}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Database</label>
                <input
                  type="text"
                  name="database"
                  value={config.database}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <input
                type="text"
                name="user"
                value={config.user}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={config.password}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Test Parameters
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Concurrent Connections</label>
              <input
                type="number"
                name="connections"
                value={config.connections}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                min="1"
                max="1000"
              />
              <p className="text-xs text-slate-500 mt-1">Number of simultaneous workers querying the database.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Duration (seconds)</label>
              <input
                type="number"
                name="duration"
                value={config.duration}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                min="1"
                max="300"
              />
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={running}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {running ? (
              <>
                <Square className="w-5 h-5 animate-pulse" />
                Test Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Stress Test
              </>
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-full min-h-[400px]">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Test Results
          </h2>

          {running && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 animate-pulse">Hammering the database...</p>
            </div>
          )}

          {error && !running && (
            <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-400">Test Failed</h3>
                <p className="text-sm text-red-300/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {results && !running && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Queries Per Second (QPS)</p>
                <p className="text-5xl font-light text-white">{results.qps.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Total Successful Queries</p>
                <p className="text-5xl font-light text-emerald-400">{results.successfulQueries.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Failed Queries</p>
                <p className="text-5xl font-light text-red-400">{results.failedQueries.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Actual Duration</p>
                <p className="text-5xl font-light text-slate-300">{results.duration.toFixed(1)}s</p>
              </div>
            </div>
          )}

          {!running && !results && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Configure parameters and click "Start Stress Test"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
