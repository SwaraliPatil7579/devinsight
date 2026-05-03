# DevInsight: A Real-Time CI/CD Pipeline Analytics and Reliability Monitoring Platform

Mrs. Rohini Jadhav
Department of Computer Engineering
Vishwakarma Institute of Technology
Pune, India
rohini.jadhav@vit.edu

Ms. Sejal Chougule
Department of Computer Engineering
Vishwakarma Institute of Technology
Pune, India
sejal.1252070056@vit.edu

Ms. Swarali Patil
Department of Computer Engineering
Vishwakarma Institute of Technology
Pune, India
swarali.patil25@vit.edu

Ms. Samiksha Ghule
Department of Computer Engineering
Vishwakarma Institute of Technology
Pune, India
samiksha.1252070059@vit.edu

Ms. Prachi Sharma
Department of Computer Engineering
Vishwakarma Institute of Technology
Pune, India
prachi.sharma25@vit.edu

---

**Abstract** — The increasing complexity of modern software delivery pipelines has made it critical for engineering teams to gain real-time visibility into deployment health, failure patterns, and recovery metrics. Existing CI/CD tools provide raw logs and status indicators but lack intelligent analytics layers capable of surfacing actionable insights. This paper presents DevInsight, a real-time CI/CD pipeline analytics and reliability monitoring platform that integrates deployment event ingestion via webhooks, statistical analytics, and recurring failure pattern detection into a unified web-based environment. The system ingests deployment events from CI/CD platforms such as GitHub Actions and Jenkins through standardized webhook endpoints, persists them in a relational database, and exposes computed metrics including deployment success rate, Mean Time to Recovery (MTTR), failure trends, and recurring failure patterns through a RESTful API. The frontend, built with React and Recharts, provides live visualizations of these metrics on an interactive dashboard. Experimental validation using a seeded dataset of 200 deployments demonstrates that the platform accurately identifies high-risk services and provides stable trend analysis. The results confirm the feasibility of deploying lightweight, real-time reliability analytics systems that integrate directly into existing CI/CD workflows without requiring changes to the underlying pipeline infrastructure.

**Keywords** — CI/CD analytics, deployment reliability, MTTR, failure pattern detection, FastAPI, React, PostgreSQL, webhook integration, DevOps observability.

---

## I. INTRODUCTION

Continuous Integration and Continuous Deployment (CI/CD) pipelines have become the backbone of modern software engineering practices. As organizations scale their engineering teams and service portfolios, the frequency of deployments increases significantly, making it harder to manually track deployment health and identify systemic reliability issues. While platforms such as Jenkins, GitHub Actions, and Bitbucket Pipelines provide execution logs and status notifications, they do not offer cross-service, cross-environment analytics that help teams understand long-term reliability trends.

The precise identification of deployment failure patterns empowers engineering teams to prioritize remediation efforts and reduce the mean time to recovery. Systems that surface these patterns proactively allow teams to shift from reactive incident response to predictive reliability management. However, many existing observability tools are either too heavyweight for small teams, require significant infrastructure investment, or are tightly coupled to specific CI/CD vendors. There is a clear need for a lightweight, vendor-agnostic analytics layer that can sit on top of any CI/CD system and provide actionable reliability metrics in real time.

Statistical methods and structured event analysis have made it possible to extract high-quality insights from deployment event streams. Modern web technologies have further simplified the deployment of such analytical systems into interactive, user-facing applications. This paper presents the design and deployment of DevInsight, a real-time CI/CD analytics platform that ingests deployment events, computes reliability metrics, detects recurring failure patterns, and visualizes results through a live dashboard.

The paper does not focus on novel machine learning models but rather on the system's architecture, real-time deployment, and practical utility for engineering teams. The key contributions of this work are as follows:

- Development of an end-to-end CI/CD analytics pipeline supporting multi-source webhook ingestion from GitHub Actions and Jenkins.
- Implementation of a statistical analytics engine computing deployment success rate, MTTR, and daily failure trends.
- A pattern detection module that identifies services with recurring failures and assigns risk levels based on failure frequency.
- Deployment of the complete system using a React–FastAPI architecture with PostgreSQL-based persistent storage and Docker-based infrastructure.
- Experimental validation demonstrating accurate failure pattern identification and real-time metric computation against a synthetic dataset of 200 deployments.

---

## II. LITERATURE SURVEY

Observability and reliability engineering have become active research and industry practice areas as software systems grow in scale and complexity. In the beginning, research mainly applied traditional monitoring approaches and threshold-based alerting, while the current trend is leaning towards intelligent analytics and pattern-based detection for better robustness and actionability.

### A. CI/CD Pipeline Observability

Traditional approaches to CI/CD monitoring relied on log aggregation tools such as ELK Stack (Elasticsearch, Logstash, Kibana) and Splunk. While powerful, these tools require significant operational overhead and are primarily designed for log search rather than structured reliability analytics. Forsgren et al. [1] established the four key metrics of software delivery performance — deployment frequency, lead time for changes, change failure rate, and time to restore service — which form the theoretical foundation for reliability analytics platforms. Their work in the DORA (DevOps Research and Assessment) program demonstrated that high-performing engineering teams consistently track these metrics to drive measurable improvement in delivery outcomes.

### B. Failure Pattern Detection in Distributed Systems

Automated failure pattern detection in software systems has been studied extensively in the context of anomaly detection and root cause analysis. Du et al. [2] proposed DeepLog, a log-based anomaly detection framework using LSTM networks that identifies recurring failure signatures in distributed systems. Their work highlighted the importance of temporal pattern analysis in distinguishing transient failures from systemic issues. The approach taken in DevInsight draws on similar principles but applies them to structured deployment event data rather than unstructured logs, making the detection computationally lightweight and directly interpretable by engineering teams without requiring model training.

### C. Mean Time to Recovery (MTTR) as a Reliability Metric

MTTR is a widely accepted reliability metric in both software engineering and systems reliability literature. Kim et al. [3] analyzed reliability practices across large-scale software organizations and found that teams which actively measure and track MTTR exhibit significantly faster incident resolution compared to those relying solely on subjective assessment. Their findings motivated the inclusion of MTTR as a first-class metric in DevInsight, computed by correlating failed deployments with subsequent successful deployments for the same service within a configurable time window.

### D. Webhook-Based Event Ingestion

Webhook-driven architectures have become the standard integration mechanism for CI/CD event propagation. Hilton et al. [4] studied the adoption of CI practices across open-source projects and found that event-driven integrations significantly reduce the latency between pipeline execution and downstream tooling, enabling near-real-time observability. DevInsight adopts this pattern by exposing dedicated webhook endpoints for GitHub Actions and Jenkins, enabling zero-configuration integration with existing pipelines. The normalization of vendor-specific payloads into a common schema is a key design principle that ensures the analytics layer remains decoupled from any specific CI/CD platform.

### E. DevOps Metrics and Continuous Delivery

Humble and Farley [5] established the foundational principles of continuous delivery, emphasizing that deployment pipelines should be treated as first-class engineering artifacts subject to measurement and improvement. Their work directly motivates the design of DevInsight as a platform that treats deployment events as structured data worthy of systematic analysis. Leite et al. [6] conducted a comprehensive survey of DevOps concepts and challenges, identifying the lack of integrated analytics tooling as a persistent gap in the DevOps toolchain, particularly for teams operating self-hosted infrastructure.

### F. Research Gap and Motivation

Despite significant progress in observability tooling, a large number of existing solutions prioritize raw data collection over actionable analytics. Tools that do provide analytics are often cloud-hosted SaaS products that raise data privacy concerns or require vendor lock-in. Furthermore, existing academic work on deployment analytics tends to focus on large-scale distributed systems with dedicated infrastructure teams, leaving a gap for lightweight solutions suitable for small to medium engineering teams. This gap motivated the design of DevInsight as a self-hosted, open-architecture analytics platform that any team can deploy alongside their existing infrastructure, with no changes required to their CI/CD pipelines beyond registering a webhook URL.

---

## III. DATASETS AND DEPLOYMENT EVENT SCHEMA

### A. Deployment Event Structure

DevInsight does not rely on a pre-existing public dataset. Instead, it defines a normalized deployment event schema that serves as the common representation for events ingested from any CI/CD source. Each deployment record captures: service name, target environment (production, staging, development), outcome status (success, failed, running), source branch, commit hash, triggering actor, start and finish timestamps, error message, and source platform identifier.

This schema is intentionally vendor-agnostic. Events from GitHub Actions carry workflow run metadata including head branch, head SHA, and conclusion. Events from Jenkins carry build status, SCM branch, and parameter metadata. Both are normalized into the same schema at ingestion time.

### B. Synthetic Evaluation Dataset

For experimental validation, a seed dataset of 200 deployment records was generated spanning a 60-day window across five representative services: `auth-service`, `payment-api`, `user-service`, `notification-service`, and `api-gateway`. Deployment timestamps were distributed randomly across the window. The `payment-api` service was assigned a 45% failure rate to simulate a service with a known reliability issue, while all other services were assigned a 15% failure rate reflecting a healthy baseline. This distribution was designed to produce a clearly detectable high-risk pattern for the `payment-api` service while keeping other services at medium or below-threshold risk levels.

### C. Analytics Computation Models

The system incorporates four analytics computations applied to the deployment event stream:

- **Success Rate Module**: Aggregates deployment counts by status within a time window and computes the ratio of successful to total deployments.
- **MTTR Module**: Pairs failed deployments with subsequent successful deployments for the same service and computes the mean recovery duration.
- **Trend Analysis Module**: Groups deployments by calendar date and produces a daily time series of total and failed deployment counts.
- **Pattern Detection Module**: Identifies services with failure counts exceeding a configurable threshold and assigns risk levels based on frequency.

---

## IV. SYSTEM ARCHITECTURE

### A. Overall Architecture

DevInsight is grounded in a two-tier architecture consisting of a React frontend, a Python FastAPI backend, and a PostgreSQL database for persistent storage. The frontend communicates with the FastAPI service via RESTful APIs. The backend handles webhook ingestion, analytics computation, and database interaction. Figure 1 illustrates the overall system architecture.

The system is designed around three core concerns: event ingestion, analytics computation, and visualization. Deployment events flow into the system either through webhook endpoints from CI/CD platforms or through a manual entry form in the UI. All events are persisted in a normalized relational schema. Analytics are computed on-demand by querying the database with time-windowed SQL aggregations.

### B. Frontend: React User Interface

The frontend is implemented as a single-page application built with React 19 and Vite 8. It consists of three views accessible through a top navigation bar. The Dashboard view displays the four key reliability metrics as summary cards — deployment success rate, total deployments in the last 30 days, mean time to recovery in minutes, and count of recurring failure patterns — alongside a 30-day deployment trend line chart rendered with Recharts and a recurring failure patterns panel that highlights high-risk services. The Deployments view provides a filterable table of all deployment records with filter controls for status and service name, alongside a manual deployment entry form for recording events outside of automated pipelines. The Webhook Simulator view allows developers to fire pre-configured Jenkins webhook payloads against the backend to validate the ingestion pipeline without requiring a live CI/CD environment.

State management is handled locally with React hooks. API communication uses Axios with a configured base URL pointing to the FastAPI service. All four analytics endpoints are called in parallel using `Promise.all` on dashboard load to minimize perceived latency.

### C. Backend: FastAPI Service

The backend is implemented using Python FastAPI, which provides asynchronous RESTful access to all platform capabilities. The API is organized into three routers registered on the application instance:

- `/deployments` — CRUD operations for deployment records, with optional query parameter filtering by status and service name, ordered by descending start time.
- `/analytics` — Four computed metrics endpoints: `/analytics/success-rate`, `/analytics/mttr`, `/analytics/trends`, and `/analytics/patterns`.
- `/webhooks` — Inbound event receivers at `/webhooks/github` and `/webhooks/jenkins`.

SQLAlchemy 2.0 is used as the ORM layer with a PostgreSQL backend. Database sessions are managed per-request using FastAPI's dependency injection system via a `get_db` generator, ensuring connection safety under concurrent load. CORS middleware is configured to allow requests from the React development server origin.

### D. Database

PostgreSQL is used for persistent storage, provisioned via the TimescaleDB Docker image which provides time-series query optimizations relevant to the deployment event workload. The `deployments` table uses a UUID primary key and stores all fields of the normalized deployment schema. The `started_at` column is the primary filter dimension for all analytics queries.

### E. Webhook Integration

DevInsight exposes two webhook endpoints that normalize vendor-specific payloads into the common deployment schema.

The GitHub Actions endpoint (`POST /webhooks/github`) processes `workflow_run` events with the `completed` action. It extracts repository name as the service identifier, head branch, head SHA truncated to 40 characters, conclusion mapped to success or failed status, and ISO 8601 timestamps for start and finish times.

The Jenkins endpoint (`POST /webhooks/jenkins`) processes build completion notifications. It maps Jenkins build status values — `SUCCESS`, `FAILURE`, `ABORTED`, and `UNSTABLE` — to the normalized status vocabulary, with all non-success states mapped to `failed`.

Both endpoints persist the normalized record to PostgreSQL and return a JSON confirmation response containing the generated deployment UUID.

---

## V. ANALYTICS ENGINE

### A. Deployment Success Rate

The success rate is computed as the ratio of successful deployments to total deployments within a configurable time window defaulting to 30 days:

```
success_rate = (successful / total) × 100
```

The query filters the `deployments` table by `started_at >= now() - timedelta(days)` and uses SQLAlchemy `func.count` aggregations to count total and successful records independently. This metric provides an immediate high-level indicator of pipeline health and is displayed as the primary metric card on the dashboard.

### B. Mean Time to Recovery (MTTR)

MTTR is computed by identifying all failed deployments within the time window and, for each failure, querying for the next successful deployment of the same service within a 24-hour window following the failure:

```
MTTR = mean( next_success.started_at − failure.started_at )
       for all matched (failure, next_success) pairs
```

The 24-hour window prevents unrelated future deployments from being incorrectly attributed as recoveries for a given failure event. The result is expressed in minutes and accompanied by the sample count used in the computation, allowing consumers to assess the statistical significance of the metric.

### C. Failure Trend Analysis

Daily failure trends are computed by retrieving all deployments within the time window and grouping them by calendar date using Python's `defaultdict`. For each date, the module counts total deployments and failed deployments. The result is a chronologically sorted list of daily records returned to the frontend for rendering as a dual-line chart with separate series for total and failed counts. This visualization allows teams to identify periods of elevated failure rates and correlate them with known release events or infrastructure changes.

### D. Recurring Failure Pattern Detection

The pattern detector queries all failed deployments within a 60-day window and groups them by service name. Services with three or more failures are included in the output. For each qualifying service, the module computes the total failure count, the timestamp of the first and last observed failure, and a risk level classification:

```
risk_level = "high"   if failure_count >= 7
           = "medium"  if 3 <= failure_count < 7
```

Results are sorted by failure count in descending order, surfacing the highest-risk services at the top of the dashboard panel. This module provides the most operationally actionable output of the analytics engine, directly guiding engineering teams toward services requiring reliability investment.

---

## VI. IMPLEMENTATION AND EVALUATION

### A. Implementation Details

The system is implemented as a continuously running, web-based platform with clearly separated concerns for user interaction, analytics computation, and data storage. The backend is built with Python 3.11 and FastAPI 0.135, with SQLAlchemy 2.0 as the ORM and psycopg2-binary 2.9 as the PostgreSQL driver. The frontend uses React 19, Vite 8, Recharts 3, and Axios 1.13. Infrastructure is containerized using Docker Compose, with PostgreSQL via the TimescaleDB image and Redis provisioned as services on ports 5432 and 6379 respectively.

The application entry point registers CORS middleware before all routers to ensure preflight requests are handled correctly. The three routers — analytics, webhooks, and deployments — are registered after middleware initialization. SQLAlchemy's `Base.metadata.create_all` is called at startup to ensure the `deployments` table exists before any requests are processed.

The seed data script generates 200 synthetic deployment records spanning 60 days across five services, with `payment-api` configured at a 45% failure rate and all other services at 15%, producing a clearly detectable high-risk pattern for demonstration and evaluation purposes.

### B. Dataset-Based Evaluation

The analytics engine was evaluated against the seeded dataset of 200 deployments. The success rate computation correctly reflected the weighted failure rates assigned during seeding, returning a rate consistent with the expected aggregate across all five services. The MTTR computation identified recovery pairs across all services, with `payment-api` exhibiting the highest average MTTR due to its elevated failure rate and consequently higher density of failure-to-recovery transitions.

The failure trend analysis produced a 60-day daily time series accurately reflecting the random temporal distribution of deployments across the seeding period, with no systematic bias introduced by the aggregation logic.

### C. Pattern Detection Evaluation

The recurring failure pattern detector was evaluated against the seeded dataset. With a 45% failure rate over approximately 40 deployments attributed to `payment-api` across the 60-day window, the service accumulated approximately 18 failures, correctly classified as `high` risk. Other services, with 15% failure rates over approximately 32 deployments each, accumulated approximately 5 failures each, correctly classified as `medium` risk where the count exceeded the threshold of 3.

The detector correctly ranked services by failure count in descending order and produced accurate first and last seen timestamps derived directly from the persisted deployment records.

### D. Webhook Integration Testing

The Webhook Simulator page was used to fire 8 simulated Jenkins webhook payloads — 4 success scenarios and 4 failure scenarios across different services — against the live backend. All 8 events were correctly ingested, normalized to the deployment schema, and persisted to PostgreSQL. The Dashboard metrics updated correctly upon page refresh, confirming end-to-end data flow from webhook ingestion through SQL persistence, analytics computation, and frontend visualization.

---

## VII. RESULTS AND DISCUSSION

### A. Experimental Setup

All components were deployed on a single development workstation running Windows 11 with Docker Desktop providing the PostgreSQL and Redis infrastructure services. The FastAPI backend ran on port 8001 and the React frontend on port 5173. PostgreSQL was provisioned via the TimescaleDB Docker image on port 5432. The seed script was executed once after backend startup to populate the evaluation dataset.

### B. Metric Accuracy

The computed metrics were validated against manually calculated ground truth values derived from the seeded dataset. Success rate, MTTR, and failure trend computations all matched expected values within floating-point rounding tolerance. The pattern detector correctly identified all services exceeding the failure threshold and assigned risk levels consistently with the defined classification criteria. Table I summarizes the observed metric values against the expected values derived from the seed configuration.

**Table I. Observed vs. Expected Metric Values (Seeded Dataset)**

| Metric | Expected | Observed |
|---|---|---|
| Overall Success Rate | ~79% | 79.5% |
| payment-api Failure Count (60d) | ~18 | 17–19 |
| payment-api Risk Level | high | high |
| Other Services Risk Level | medium | medium |
| MTTR Sample Count | >0 | confirmed |

### C. System-Level Performance

The FastAPI backend handles analytics queries efficiently, with all four metric endpoints completing in under 100ms against the 200-record dataset. The time-windowed SQL queries benefit from PostgreSQL's sequential scan optimization at this dataset scale. The React frontend renders the full dashboard, including the Recharts line chart, within a single render cycle after the parallel `Promise.all` API calls resolve, resulting in a perceived load time under 500ms on a local network.

The webhook endpoints process and persist incoming events in under 50ms per request, making them suitable for high-frequency deployment environments without introducing measurable latency into the CI/CD pipeline notification path.

### D. Discussion

DevInsight demonstrates the practical value of a focused, lightweight analytics layer built on top of standard CI/CD webhook infrastructure. The modular architecture — with separate routers for ingestion, analytics, and CRUD operations — allows each concern to be developed, tested, and extended independently. The use of SQLAlchemy's dependency injection pattern for database session management ensures that the system handles concurrent requests safely without connection leaks.

A key design decision was to compute all analytics on-demand via SQL aggregations rather than maintaining pre-computed materialized views. This simplifies the architecture significantly at the cost of query latency, which is acceptable for the current dataset scale. For production deployments with millions of records, a time-series database with continuous aggregates or a pre-aggregation strategy would be warranted.

The weighted failure rate assigned to `payment-api` in the seed data intentionally mirrors a common real-world scenario: a service with a known reliability issue that has not yet been prioritized for remediation. The pattern detector surfaces this service immediately on the dashboard, demonstrating the practical utility of the detection module in directing engineering attention to the highest-risk areas of the system.

There are several limitations associated with the current implementation. First, the use of fixed time windows for analytics queries (30 days for metrics, 60 days for pattern detection) does not accommodate teams with different deployment cadences. Second, the MTTR computation uses a fixed 24-hour recovery window, which may not be appropriate for services with longer natural recovery cycles. Third, the system currently lacks authentication, making it unsuitable for production deployment without an additional security layer. Fourth, the pattern detection threshold of three failures is a fixed heuristic that may produce false positives for services with low deployment frequency.

---

## VIII. CONCLUSION AND FUTURE WORK

This paper presented DevInsight, a real-time CI/CD pipeline analytics and reliability monitoring platform that integrates webhook-based deployment event ingestion, statistical analytics computation, and interactive visualization into a unified web application. The system addresses a practical gap in the DevOps tooling landscape by providing actionable reliability metrics — deployment success rate, MTTR, failure trends, and recurring failure patterns — without requiring changes to existing CI/CD infrastructure beyond webhook registration.

Evaluation against a synthetic dataset of 200 deployments confirmed the accuracy of all analytics computations and the correct operation of the pattern detection module. The webhook integration was validated end-to-end using the built-in simulator. The React–FastAPI–PostgreSQL architecture proved well-suited for this class of real-time analytics application, with all endpoints responding within acceptable latency bounds for interactive use.

The results validate the feasibility of deploying lightweight, self-hosted reliability analytics systems that integrate directly into existing CI/CD workflows. The modular design of the analytics engine and the vendor-agnostic deployment event schema provide a solid foundation for extension to additional CI/CD platforms and more sophisticated analytics methods.

Future work will focus on the following directions:

- **Adaptive time windows** — Exposing analytics window parameters as configurable UI controls to accommodate teams with varying deployment cadences.
- **Authentication and multi-tenancy** — Adding JWT-based authentication and team-scoped data isolation for production deployment.
- **Alerting integration** — Pushing high-risk pattern alerts to Slack or PagerDuty when failure thresholds are exceeded, enabling proactive notification without requiring dashboard monitoring.
- **Extended webhook support** — Adding normalized ingestion for Bitbucket Pipelines, GitLab CI, and CircleCI to broaden platform coverage.
- **Time-series optimization** — Migrating analytics queries to leverage TimescaleDB continuous aggregates for scalability to millions of deployment records.
- **Adaptive pattern detection** — Replacing the fixed failure threshold with a statistically adaptive threshold based on each service's historical deployment frequency, reducing false positives for low-frequency services.
- **Comparative benchmarking** — Evaluating the platform against existing observability tools such as Datadog CI Visibility and LinearB on standardized reliability datasets to quantify the value of the integrated analytics approach.

The proposed system provides a scalable and deployable foundation for reliability-aware DevOps tooling that meets practical real-time constraints while remaining lightweight enough for self-hosted deployment by small to medium engineering teams.

---

## REFERENCES

[1] N. Forsgren, J. Humble, and G. Kim, *Accelerate: The Science of Lean Software and DevOps*, IT Revolution Press, Portland, OR, USA, 2018.

[2] M. Du, F. Li, G. Zheng, and V. Srikumar, "DeepLog: Anomaly detection and diagnosis from system logs through deep learning," in *Proc. ACM SIGSAC Conf. Computer and Communications Security (CCS)*, Dallas, TX, USA, 2017, pp. 1285–1298.

[3] G. Kim, P. Debois, J. Willis, and J. Humble, *The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security in Technology Organizations*, IT Revolution Press, Portland, OR, USA, 2016.

[4] M. Hilton, T. Tunnell, K. Huang, D. Marinov, and D. Dig, "Usage, costs, and benefits of continuous integration in open-source projects," in *Proc. IEEE/ACM Int. Conf. Automated Software Engineering (ASE)*, Singapore, 2016, pp. 426–437.

[5] J. Humble and D. Farley, *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*, Addison-Wesley, Upper Saddle River, NJ, USA, 2010.

[6] A. Leite, C. Rocha, F. Kon, D. Milojicic, and P. Meirelles, "A survey of DevOps concepts and challenges," *ACM Computing Surveys*, vol. 52, no. 6, Art. 127, pp. 1–35, Jan. 2020.

[7] C. Parnin, E. Helms, C. Atlee, H. Boughton, M. Ghattas, A. Glover, J. Holman, J. Micco, B. Murphy, T. Savor, M. Stumm, S. Whitaker, and L. Williams, "The top 10 adages in continuous deployment," in *Proc. IEEE/ACM Int. Workshop on Release Engineering (RELENG)*, Austin, TX, USA, 2017, pp. 1–4.

[8] D. Taibi, V. Lenarduzzi, and C. Pahl, "Architectural patterns for microservices: A systematic mapping study," in *Proc. Int. Conf. Cloud Computing and Services Science (CLOSER)*, Funchal, Portugal, 2018, pp. 221–232.
