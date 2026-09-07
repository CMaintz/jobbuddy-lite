---
framework_version: 1.1.1
---

# Candidate Profile

## Identity
- **Name:** Christoffer Maintz (full legal name: Christoffer Romm Maintz Andersen)
- **Location:** Viby Torv 8, st. tv, 8260 Viby J (Aarhus), Denmark
- **Phone:** +45 22 66 56 25
- **Email:** cmaintz@outlook.com
- **LinkedIn:** https://linkedin.com/in/christoffer-maintz
- **GitHub:** https://github.com/CMaintz
- **Status:** Newly graduated Datamatiker (AP Degree in Computer Science, completed 2026-01-09), seeking first full-time software developer role, backend-leaning.
- **Constraints:** Greater Aarhus area preferred (on-site fine within commute range). Hybrid/remote acceptable elsewhere in Denmark depending on distance; fully remote required if very far. No relocation. Young family (fiancée + young son).

### Languages
<!-- Used by the Language Gate in 04-job-evaluation.md and by search-queries.md. -->

| Language | Level | Notes |
|----------|-------|-------|
| Danish | Native | Native / mother tongue |
| English | Fluent (professional working proficiency) | Comfortable writing English CVs, cover letters and working in English-first teams |

## Education

| Degree | Period | Institution | Key Topics |
|--------|--------|-------------|------------|
| Datamatiker / AP Degree in Computer Science | Aug 2023 - Jan 2026 | Erhvervsakademi Aarhus (Business Academy Aarhus) | Programming & databases, system development & business, distributed systems & networks, advanced programming; electives Advanced Databases + iOS; final exam project = the WEXO AI enrichment platform |
| HF (Higher Preparatory Examination) | Aug 2021 - Jun 2023 | Aarhus HF & VUC | General upper-secondary qualification |

**Grade highlights (Datamatiker transcript):** Internship 12 (A); Programming and Databases 10 (B); System Development and Business 10 (B); Advanced Programming 10 (B); Specialisation C#/.NET & iOS 10 (B); Final Exam Project 7 (C). Total 150 ECTS. Language of instruction: Danish.

## Professional Experience

### Software Developer / Backend Software Engineer (Intern) - WEXO A/S (Aug 2025 - Jan 2026)
Aarhus, Denmark. (Internship work period 2025-08-11 to 2025-12-19; formally concluded Jan 2026.)
- Sole developer of an **AI-powered product-enrichment & visualization platform** (Shopware 6 plugin) for the WEXO client Illux (an art dealer), taken end-to-end from technical design and architecture to production deployment. Originally scoped as an ambitious final exam project expected to be only partly implemented; finished in full production and deployed to the client days before the internship ended. Still in daily use.
- **Product enrichment (backend + admin):** sends product images + attributes to Google Gemini and receives schema-driven JSON (SEO metadata, customer-facing descriptions, whitelisted property/category/tag suggestions) in four languages (da/en/nn/sv) per API call. Provider-agnostic AI integration behind a shared abstraction layer.
- **Resilient async processing:** Symfony Messenger over RabbitMQ, batches up to 500 products/run (6 per API call), retry with exponential backoff, domain-level idempotency (redelivery guarded by `ai_batch_job` status so retries never overwrite successes).
- **AI governance:** full audit trail (reviewing admin, exact prompt, Gemini model + version, confidence score, approval history, batch provenance); transaction-safe approval workflow; fully configurable heuristic confidence model (adjustable weights, thresholds, negative word/phrase list); confidence-gated automation with fallback to manual review.
- **Deep Shopware integration:** custom DAL entities + translations, 8 DB migrations, property/custom-field installers, scheduled task and CLI command.
- **Artwork visualization (storefront + admin):** TypeScript storefront plugin letting customers preview artwork on their own or AI-generated room scenes with frame-accurate compositing; live per-scene progress via Server-Sent Events; admin module (Vue) generates photorealistic interior scenes (gemini-2.5-flash-image) from structured photographic parameters; deep prompt engineering (a 357-line composition-prompt builder).
- **Impact:** eliminated manual enrichment for the majority of a 3,000+ product catalogue (~3,500 by end of 2025), ~20 min saved per product, est. 1,000+ hours; foundation for the client's upcoming crowdsourced artwork platform.
- **Also built:** an email-template preview system (Shopware 6) rendering transactional mails against real order data (configurable products, options, nested line items) across devices/email clients, letting content managers validate templates before customer-facing use.
- Contributed across frontend and backend, integrated third-party APIs/webhooks, participated in the full lifecycle (requirements, implementation, test, deployment), code reviews, pair programming and production debugging.

### Salgsleder / Sales Manager - Netto (Salling Group) (May 2017 - Oct 2023)
Aarhus, Denmark. Progressed from First Assistant (1. Assistent) to Sales Manager.
- Team leadership, recruitment and staff development; operational and staffing planning and coordination.
- Led daily operations and process improvement/optimization.
- Led a waste-reduction initiative saving approximately 1M DKK annually.
- Cash handling, ordering, customer service, job interviews and performance reviews.

### Souschef / Assistant Store Manager - Kiwi (Oct 2015 - May 2017)
Aarhus, Denmark. Progressed from First Assistant (1. Assistent) to Assistant Store Manager.
- Co-responsible for daily operations, planning and staff coordination.
- Recruitment, onboarding and supporting management.
- Cash handling, ordering, customer service, interviews and performance reviews.

## Independent Projects
- **AutoApplicant** (May 2026 - present, in development, sole developer): Full-stack AI job-application platform that imports/crawls job postings, maintains a structured career profile, and generates role-tailored CVs + applications via OpenAI, with ATS-match reports and PDF export. Strict hexagonal (ports & adapters): AI provider, search engine and persistence are swappable adapters. AI output as structured JSON collated into one `StructuredDocument` model; PII excluded from the AI payload (privacy-by-design). *Tech:* Java, Spring Boot, hexagonal architecture, Angular, TypeScript, PostgreSQL, pgvector, Flyway, Typesense, vector/semantic search, OpenAI (gpt-4o / gpt-4o-mini), Google Gemini, Firebase Auth, JWT, Docker Compose, OpenAPI/Swagger.
- **DevInsight** (Mar 2026 - present, in development, sole developer): Developer-analytics platform that imports a developer's GitHub repos and scores them on activity, structure and code quality for a data-driven portfolio page. Java/Spring Boot, strict hexagonal, GitHub OAuth2 → JWT, repo import via kohsuke/github-api, JPA persistence. Scoring engine designed, partially stubbed. *Tech:* Java, Spring Boot, Spring Security, OAuth2, JWT, Spring Data JPA, PostgreSQL, Flyway, GitHub API, Maven.
- **MDB - Movie & TV Browser** (2025-2026, sole developer): One React codebase running as both a web app and a sideloaded LG webOS smart-TV app. Aggregates ratings (TMDB, IMDb via OMDb, Rotten Tomatoes), country detection → streaming availability, deep-links via webOS Luna, Firebase-synced wishlist/watched. Same React tree works with mouse and TV remote. *Tech:* React, TypeScript, Vite, Tailwind, TanStack Query, Firebase (Auth + Firestore), LG webOS, spatial (D-pad) navigation.
- **MovieWheel** (May-Jun 2026, sole developer): "What should we watch tonight?" web app: filter, spin a 12-slot wheel, get a title + where it streams. Static React front-end + thin hardened Vercel serverless proxy (per-IP sliding-window rate limit, path allow-list, edge caching). Spin modelled as an explicit state machine. *Tech:* React, TypeScript, Vite, Tailwind, TanStack Query, Vercel functions, rate limiting.

### Notable academic projects
- **Sall Whisky Distillery** (3rd sem, ~autumn 2024, grade 10): Rule-heavy production-control domain built twice — original JavaFX desktop (3-tier, object serialization), then a Spring Boot 3.2 REST + Angular 17 SPA rewrite. Domain rules: 3-year maturation checks, volume-weighted ABV, whisky-type classification, re-barrelling with preserved aging history.
- **TimeRegistry** (4th sem, ~spring 2025, grade 7): One business core, two front-ends — WPF desktop (MVVM) + ASP.NET MVC web over the same BLL/DAL. Interface-based contracts, Autofac DI, EF6 with generic `Repository<T>`, overlap detection and 37-hour weekly cap.
- **HesteProjekt (riding-school booking)** (4th sem, grade 10): C#/ASP.NET MVC, deliberately hand-written ADO.NET DAO layer (no ORM), role-based auth with BCrypt-hashed passwords, SMTP notifications.
- **Birdie (bird-watching iOS app)** (iOS exam, ~mid-2025, grade 10): SwiftUI, Firebase auth/Firestore/Storage, MapKit + Core Location, protocol-oriented service/repository layer.
- **Multiplayer Maze Game** (3rd sem, ~autumn 2024): Pac-Man-inspired multiplayer maze over raw TCP sockets on a real LAN; Java ServerSocket, one thread per client, synchronized broadcast relay, self-designed text protocol; JavaFX clients.

## Technical Skills

### Programming & Backend
- **C# / .NET** (primary): ASP.NET Core & MVC, ASP.NET Web API, WPF, Entity Framework (EF6), Blazor
- **Java** (primary): Spring Boot, Spring Data JPA, Spring Security, JavaFX; some Quarkus
- **PHP** (professional, WEXO): Symfony, Symfony Messenger, Shopware 6 (plugins, DAL, migrations, scheduled tasks, CLI)
- **TypeScript / JavaScript:** Angular (incl. signals), React, Vue, Node.js/Express, Vite, TanStack Query
- **Swift:** SwiftUI, Swift Concurrency, MapKit, Core Location (iOS); some Kotlin/Android
- **SQL:** MS SQL Server/T-SQL, PostgreSQL (+ pgvector), MySQL, Oracle/PL-SQL, H2

### Architecture & Systems
- REST API design, event-driven architecture, RabbitMQ / message-driven processing, asynchronous workflows, integration design, distributed systems
- Design patterns (Orchestrator, Builder + Director, Factory, Message/Handler, Subscriber, Composite, Observer, Adapter, Singleton), SOLID & GRASP, MVC, MVVM, three-tier, clean architecture, hexagonal (ports & adapters), modular monolith, microservices, SOA
- Idempotency, retries, rate limiting, crash recovery, Server-Sent Events, webhooks, transactions & atomicity, multithreading/concurrency, socket programming

### AI / LLM & Automation
- LLM integration: OpenAI, Google Gemini (text + image models), Claude; prompt engineering (Builder + Director); schema-driven / structured JSON output
- RAG, embeddings, vector databases (pgvector, Typesense), Model Context Protocol (MCP), LangChain, n8n
- Heuristic confidence/quality scoring with configurable weights, human-in-the-loop / approval workflows, AI governance (audit trails, versioning, traceability), cost/performance trade-offs in production AI

### Domain Expertise
- Backend & distributed-systems development; integration-heavy, event-driven systems with strict correctness/traceability/error-handling requirements
- Production/operations ("drift"): monitoring, logging, observability, dashboards, alerts, production debugging, on-prem production environments
- Data: data modelling, indexing, query optimization, schema design, migrations (Flyway), data integrity & quality, caching, performance optimization
- Security: authentication & authorization, token-based flows, JWT, OAuth2, Firebase Auth, BCrypt, SQL-injection prevention

### Software & Tools
- Git, GitHub, GitLab; Docker, Docker Compose, DDev; CI/CD (GitHub Actions, GitLab CI); Maven; OpenAPI/Swagger; some Azure (Functions, SQL) / AWS / Kubernetes exposure
- Testing: JUnit, PHPUnit, XDebug, acceptance testing; TDD, unit/integration/system tests
- IDEs: IntelliJ IDEA, JetBrains Rider, Visual Studio, VS Code, PhpStorm, Xcode, Android Studio
- Postman, Wireshark, Jira, Trello, Visual Paradigm, Balsamiq
- **Claude Code** (agentic AI coding)
- Ways of working: Scrum, XP, code reviews, pair programming, production-near development

## Publications
None.

## Awards
No competition/hackathon awards on record. (Notable academic recognition: internship graded 12/A; several projects graded 10/B.)

## References
- **Thomas Holm Thomsen**, Partner, WEXO A/S (kontakt@wexo.dk, +45 7199 4816) - wrote a written recommendation following the internship.

More references available upon request.
