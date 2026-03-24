# RDS Proxy Stress Tester

This application provides a complete, end-to-end solution for provisioning, stress testing, and monitoring an AWS RDS PostgreSQL instance and an RDS Proxy.

**Important:** The tools in this application are **100% real**, not simulated. They execute actual database queries and fetch real metrics from the AWS API.

## Features

### 1. Infrastructure (Terraform)
Provides ready-to-deploy Terraform code that provisions:
* A low-cost `db.t4g.micro` PostgreSQL instance.
* An RDS Proxy configured for connection pooling.
* Secure, production-grade credentials using AWS Secrets Manager (a random password is automatically generated).
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

## Cost Estimation

This infrastructure is designed to be as low-cost as possible while still demonstrating real RDS Proxy connection pooling. Below is an estimated cost breakdown for running this setup in `us-east-1` (N. Virginia).

**Estimated Hourly Cost: ~$0.06 / hour**
**Estimated 24-Hour Cost: ~$1.30 / day**

### Breakdown of Costs
* **RDS Instance (`db.t4g.micro`)**: ~$0.016 / hour
* **RDS Storage (20 GB)**: ~$0.003 / hour (~$2.30 / month)
* **RDS Proxy**: ~$0.030 / hour (Priced per underlying DB vCPU. `db.t4g.micro` has 2 vCPUs at ~$0.015 per vCPU-hour)
* **EC2 Spot Instance (`t3.micro`)**: ~$0.004 / hour (Spot pricing varies, but is capped at $0.01 in the Terraform config)
* **AWS Secrets Manager**: ~$0.001 / hour ($0.40 per secret / month)
* **Data Transfer & CloudWatch**: Negligible for 15 minutes of light stress testing per day.

*Note: While the `db.t4g.micro` instance may fall under the AWS Free Tier for new accounts, **RDS Proxy does not have a free tier** and will incur charges as long as it is provisioned. Remember to run `terraform destroy` when you are finished testing to avoid unexpected charges.*

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
