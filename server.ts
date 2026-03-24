import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import pg from 'pg';
import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const { Pool } = pg;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Stress test endpoint
  app.post('/api/stress-test', async (req, res) => {
    const { host, port, user, password, database, connections, duration } = req.body;

    if (!host || !user || !password || !database || !connections || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const pool = new Pool({
        host,
        port: port || 5432,
        user,
        password,
        database,
        max: connections,
        connectionTimeoutMillis: 5000,
      });

      let running = true;
      let successfulQueries = 0;
      let failedQueries = 0;
      const startTime = Date.now();

      // Stop the test after 'duration' seconds
      setTimeout(() => {
        running = false;
      }, duration * 1000);

      const worker = async () => {
        while (running) {
          try {
            // Simple query to stress the DB and proxy
            await pool.query('SELECT 1;');
            successfulQueries++;
          } catch (err) {
            failedQueries++;
            if (failedQueries === 1) {
              console.error('First query failure:', err);
            }
            // Small delay to prevent tight loop on failure
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      // Start workers
      await Promise.all(Array.from({ length: connections }).map(worker));

      const endTime = Date.now();
      const actualDuration = (endTime - startTime) / 1000;
      const qps = successfulQueries / actualDuration;

      await pool.end();

      res.json({
        successfulQueries,
        failedQueries,
        duration: actualDuration,
        qps: Math.round(qps),
      });
    } catch (error) {
      console.error('Stress test error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // CloudWatch metrics endpoint
  app.post('/api/metrics', async (req, res) => {
    const { accessKeyId, secretAccessKey, region, rdsInstanceId, rdsProxyName } = req.body;

    if (!region || !rdsInstanceId || !rdsProxyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const client = new CloudWatchClient({
        region,
        credentials: (accessKeyId && secretAccessKey) ? {
          accessKeyId,
          secretAccessKey,
        } : undefined, // Fallback to default credentials provider chain if not provided
      });

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last 1 hour

      const command = new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        MetricDataQueries: [
          {
            Id: 'rdsCpu',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/RDS',
                MetricName: 'CPUUtilization',
                Dimensions: [{ Name: 'DBInstanceIdentifier', Value: rdsInstanceId }],
              },
              Period: 60,
              Stat: 'Average',
            },
            ReturnData: true,
          },
          {
            Id: 'rdsConnections',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/RDS',
                MetricName: 'DatabaseConnections',
                Dimensions: [{ Name: 'DBInstanceIdentifier', Value: rdsInstanceId }],
              },
              Period: 60,
              Stat: 'Average',
            },
            ReturnData: true,
          },
          {
            Id: 'proxyClientConnections',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/RDS',
                MetricName: 'ClientConnections',
                Dimensions: [{ Name: 'DBProxyName', Value: rdsProxyName }],
              },
              Period: 60,
              Stat: 'Average',
            },
            ReturnData: true,
          },
          {
            Id: 'proxyDbConnections',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/RDS',
                MetricName: 'DatabaseConnections',
                Dimensions: [{ Name: 'DBProxyName', Value: rdsProxyName }],
              },
              Period: 60,
              Stat: 'Average',
            },
            ReturnData: true,
          },
        ],
      });

      const response = await client.send(command);
      
      // Format the data for Recharts
      const formattedData: any[] = [];
      const timestamps = response.MetricDataResults?.[0]?.Timestamps || [];
      
      timestamps.forEach((ts, index) => {
        const dataPoint: any = { time: ts.toISOString() };
        response.MetricDataResults?.forEach(result => {
          if (result.Id && result.Values && result.Values[index] !== undefined) {
            dataPoint[result.Id] = result.Values[index];
          }
        });
        formattedData.push(dataPoint);
      });

      // Sort by time ascending
      formattedData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      res.json(formattedData);
    } catch (error) {
      console.error('CloudWatch metrics error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
