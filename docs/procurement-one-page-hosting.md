# Procurement One-Page: Hosting Recommendation (Autoscaling)

Date: 2026-05-21  
Project: FEN Learn LMS  
Target Capacity: 100 to 300 typical online users, with periodic spikes up to 5000 concurrent users

## 1) Recommended Choice

Recommendation: AWS

Rationale:
- Better fit for Laravel LMS using containerized PHP app + separate queue workers.
- Strong autoscaling controls for both web tier and worker tier.
- Mature managed services for MySQL, Redis, object storage, CDN, and WAF in one stack.
- Cleaner path from launch size (500) to peak target (5000) without platform redesign.

## 2) Exact Initial SKU List (Burst-Aware Month-1 Baseline)

Region assumption: ap-southeast-1 (Singapore), Linux on-demand pricing model for baseline procurement.

| Layer | Service | Exact SKU / Tier | Qty | Purpose |
|---|---|---|---|---|
| Edge Security | AWS WAF | Web ACL (standard managed rules) | 1 | L7 protection |
| CDN | Amazon CloudFront | Standard distribution | 1 | Global content delivery |
| Load Balancer | Application Load Balancer | ALB | 1 | HTTP/HTTPS ingress |
| App Compute | Amazon EC2 Auto Scaling | m7i.large | 2 | Laravel web app nodes (baseline floor) |
| Worker Compute | Amazon EC2 Auto Scaling | t3.medium | 1 | Queue/email workers (baseline floor) |
| Database | Amazon RDS MySQL (Multi-AZ) | db.m7g.large | 1 cluster (HA) | Primary transactional DB |
| DB Storage | RDS GP3 Storage | 500 GB | 1 | Database storage |
| Cache/Session | Amazon ElastiCache for Redis | cache.r7g.large | 2 nodes (primary+replica) | Session/cache/rate-limit |
| Object Storage | Amazon S3 Standard | 2 TB initial allocation target | 1 bucket set | Uploads/certificates/assets |
| Networking | NAT Gateway | Standard NAT | 2 | Private subnet egress |
| Observability | Amazon CloudWatch | Metrics + Logs | 1 account scope | Monitoring/alerts/logs |
| Backup | AWS Backup + Snapshots | RDS/S3 policy | 1 policy set | Retention and recovery |

## 3) Autoscaling Baseline (Procurement Settings)

Web tier autoscaling:
- Min instances: 2
- Desired instances: 2
- Max instances: 24
- Scale-out trigger: average CPU > 65% for 10 minutes or ALB request pressure threshold
- Scale-in trigger: average CPU < 40% for 20 minutes

Worker tier autoscaling:
- Min instances: 1
- Desired instances: 1
- Max instances: 10
- Scale-out trigger: queue depth and worker CPU

Database scaling path:
- Month-1 baseline: db.m7g.large Multi-AZ
- Scale-up path for higher concurrency: db.m7g.2xlarge then db.m7g.4xlarge + read replica(s)

Spike handling profile (every ~2 weeks, 2 to 3 hours):
- Scheduled pre-scale 30 to 60 minutes before expected spike window.
- Temporary web desired capacity to 12 to 16 instances during spike window.
- Temporary worker desired capacity to 4 to 6 instances during spike window.
- Optional scheduled DB scale-up to db.m7g.xlarge during known spike windows if load tests show authentication/database pressure.

## 4) Budget Forecast

### 4.1 Month-1 and Month-6 Forecast (USD)

Forecast assumptions:
- 50% of time at minimum baseline capacity.
- Typical daily concurrency mostly 100 to 300 users.
- One short spike event every 2 weeks (2 to 3 hours each) with temporary scale-out.

| Forecast Point | Infra Monthly Cost (On-Demand) | Notes |
|---|---|---|
| Month-1 (Go-live) | 1,650 | Baseline for 100 to 300 users, includes short periodic spikes |
| Month-6 (Growth) | 2,450 | Assumes moderate growth with same burst pattern |

### 4.2 Up to 3 Years Hosting Cost (USD)

Assumptions:
- Gradual user growth from 500 toward 5000 concurrency target.
- Includes core cloud infra only (compute, DB, cache, storage, CDN, WAF, monitoring, backup).
- Excludes one-off migration effort and application development changes.

| Period | Estimated Cost |
|---|---|
| Year 1 | 25,800 |
| Year 2 | 32,400 |
| Year 3 | 40,800 |
| 3-Year Total (On-Demand) | 99,000 |
| 3-Year Total + 12% contingency | 110,880 |

Commercial optimization note:
- If finance approves Savings Plans / Reserved capacity after stabilization, expected reduction is typically 20% to 30% on compute-heavy portions.

## 5) Procurement Decision Summary

Approved baseline to purchase now:
1. Adopt AWS reference stack and Month-1 SKU list in Section 2.
2. Approve monthly budget envelope of USD 1,650 for launch under burst-aware assumptions.
3. Approve growth envelope to USD 2,450 by Month-6.
4. Reserve 3-year hosting budget ceiling of USD 110,880 including contingency.
5. Run performance test gates at 300, 500, 1500, 3000, and 5000 concurrent users before each scale step.
