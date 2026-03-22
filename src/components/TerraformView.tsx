import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { terraformCode } from '../terraform/main.tf';

export default function TerraformView() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(terraformCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Infrastructure Setup</h2>
        <p className="text-slate-400 mb-6">
          This Terraform configuration creates a low-end RDS PostgreSQL instance (<code>db.t4g.micro</code>), an RDS Proxy, and an EC2 Spot instance (<code>t3.micro</code>) for stress testing. It also configures the necessary IAM roles, Secrets Manager, and Security Groups.
        </p>
        
        <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">main.tf</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-300">
              <code>{terraformCode}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-white mb-3">How to deploy</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
            <li>Save the code above to a file named <code>main.tf</code>.</li>
            <li>Run <code>terraform init</code> to initialize the working directory.</li>
            <li>Run <code>terraform apply</code> to provision the resources.</li>
            <li>Note the outputs: <code>rds_proxy_endpoint</code> and <code>ec2_public_ip</code>.</li>
          </ol>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-white mb-3">Testing from your laptop</h3>
          <p className="text-sm text-slate-400 mb-3">
            RDS Proxy is VPC-only and cannot be made public. To stress test from your laptop, you must use SSH port forwarding through the EC2 Spot instance:
          </p>
          <div className="bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto">
            <code className="text-xs text-emerald-400 whitespace-nowrap">
              ssh -i your-key.pem -N -L 5432:&lt;rds_proxy_endpoint&gt;:5432 ec2-user@&lt;ec2_public_ip&gt;
            </code>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Then, in the Stress Test tab, use <code>localhost</code> as the host.
          </p>
        </div>
      </div>
    </div>
  );
}
