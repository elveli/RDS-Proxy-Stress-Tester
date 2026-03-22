import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Activity, AlertCircle } from 'lucide-react';

export default function MetricsView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    rdsInstanceId: 'stress-test-db',
    rdsProxyName: 'stress-test-proxy',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format time for X-axis
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          CloudWatch Metrics Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-400 mb-1">Region</label>
            <input
              type="text"
              name="region"
              value={config.region}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">RDS Instance ID</label>
            <input
              type="text"
              name="rdsInstanceId"
              value={config.rdsInstanceId}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">RDS Proxy Name</label>
            <input
              type="text"
              name="rdsProxyName"
              value={config.rdsProxyName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">AWS Access Key ID (Optional)</label>
            <input
              type="text"
              name="accessKeyId"
              value={config.accessKeyId}
              onChange={handleChange}
              placeholder="Leave blank if running on EC2 with IAM role"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">AWS Secret Access Key (Optional)</label>
            <input
              type="password"
              name="secretAccessKey"
              value={config.secretAccessKey}
              onChange={handleChange}
              placeholder="Leave blank if running on EC2 with IAM role"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="lg:col-span-1 flex items-end">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Fetch
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-400">Failed to fetch metrics</h3>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-white mb-4">Connections (Proxy vs DB)</h3>
          <div className="h-72">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    labelFormatter={formatTime}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="proxyClientConnections" name="Proxy Client Conns" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="proxyDbConnections" name="Proxy DB Conns" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="rdsConnections" name="RDS Direct Conns" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                {loading ? 'Loading...' : 'No data available. Click Fetch to load metrics.'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-white mb-4">RDS CPU Utilization (%)</h3>
          <div className="h-72">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    labelFormatter={formatTime}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="rdsCpu" name="CPU %" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                {loading ? 'Loading...' : 'No data available. Click Fetch to load metrics.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
