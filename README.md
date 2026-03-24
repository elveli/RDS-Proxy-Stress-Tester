# RDS Proxy Stress Tester

This application provides a complete, end-to-end solution for provisioning, stress testing, and monitoring an AWS RDS PostgreSQL instance and an RDS Proxy.

**Important:** The tools in this application are **100% real**, not simulated. They execute actual database queries and fetch real metrics from the AWS API.

## Features

### 1. Infrastructure (Terraform)
Provides ready-to-deploy Terraform code that provisions:
* A low-cost `db.t4g.micro` PostgreSQL instance.
* An RDS Proxy configured for connection pooling.
* An EC2 Spot instance (`t3.micro`) to act as a bastion host/worker.
* All necessary VPC networking, Security Groups, IAM Roles, and Secrets Manager configurations.

### 2. Real Stress Testing
A Node.js backend using the official `pg` (PostgreSQL) driver to execute real concurrent queries against your database.
* Spins up asynchronous workers based on your requested concurrency.
* Rapidly fires `SELECT 1;` queries in a tight loop.
* Calculates actual Queries Per Second (QPS), successes, and failures.

### 3. Real CloudWatch Metrics
Integrates directly with the AWS CloudWatch API using `@aws-sdk/client-cloudwatch`.
* Fetches real historical data points from the last 60 minutes.
* Monitors `CPUUtilization` for the RDS instance.
* Compares `ClientConnections` against `DatabaseConnections` on the RDS Proxy to visualize connection pooling in action.

## Getting Started (Running the UI)

To run this application locally:

1. Install the project dependencies:
   ```bash
   npm install
   ```
2. Start the development server (this runs both the React frontend and the Node.js backend):
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`.

## How to Use

### Step 1: Deploy Infrastructure
1. Copy the Terraform code from the **Infrastructure** tab.
2. Save it as `main.tf` and run `terraform init` followed by `terraform apply`.
3. Note the outputs for `rds_proxy_endpoint` and `ec2_public_ip`.

### Step 2: Set Up SSH Tunnel
RDS Proxy is strictly VPC-only and cannot be accessed directly from the public internet. To run the stress test from your local machine (or this web app running locally), you must tunnel through the EC2 Spot instance:

```bash
ssh -i /path/to/your-key.pem -N -L 5432:<rds_proxy_endpoint>:5432 ec2-user@<ec2_public_ip>
```

### Step 3: Run the Stress Test
1. Navigate to the **Stress Test** tab.
2. Set the Host to `localhost` (which routes through your SSH tunnel to the proxy).
3. Configure your concurrent connections and duration.
4. Click **Start Stress Test** to begin hammering the database.

### Step 4: Monitor Metrics
1. Navigate to the **CloudWatch Metrics** tab.
2. Enter your AWS Region, RDS Instance ID, RDS Proxy Name, and AWS Credentials.
3. Click **Fetch** to pull the latest metrics.
4. Watch the `Proxy Client Conns` spike while the `Proxy DB Conns` remain stable, proving the proxy is working!
