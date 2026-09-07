---
framework_version: 1.0.0
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Drawn from real experience. Verify specifics against 01-candidate-profile.md before use, and
tune the emphasis to the interviewing company. -->

### 1. WEXO AI Product-Enrichment Platform (ownership, delivery under uncertainty)
**S:** During my WEXO internship, the client Illux had a 3,000+ product art catalogue where categories, tags, metadata and translations were missing and had to be created manually per product - a growing, repetitive burden.
**T:** As sole developer I owned the system end-to-end, from technical design and architecture to production deployment. It was scoped as an ambitious final exam project where only part was expected to be implemented.
**A:** I designed an event-driven Shopware 6 plugin: Symfony Messenger over RabbitMQ, batching, retry with exponential backoff and domain-level idempotency. Product images + attributes go to Google Gemini and return schema-driven JSON (SEO, descriptions, category/tag suggestions) in four languages. I made deliberate architecture decisions (Orchestrator, Builder+Director for prompts, Factory, Message/Handler) based on real payload-size and volume analysis, with sparring from senior engineers and my mentor.
**R:** It shipped in full production days before the internship ended and remains in daily use. It eliminated manual enrichment for most of the catalogue, ~20 min saved per product, an estimated 1,000+ hours, and became the foundation for the client's upcoming crowdsourced artwork platform. It was also the basis of my final exam.
**Use for:** "Tell me about a project you're proud of", "Describe a time you owned something end-to-end", "How do you handle ambiguity/scope?", "Biggest technical challenge"

### 2. Confidence-gated AI automation (data quality, trustworthy AI, judgment)
**S:** Automatically generated product content can't just be trusted blindly - wrong descriptions or metadata would reach real customers.
**T:** I had to make generative-AI automation reliable and trustworthy enough for production.
**A:** I built a configurable heuristic confidence model (adjustable weights, thresholds, a negative word/phrase list the client could edit), confidence-gated automation with fallback to manual review, a transaction-safe approval workflow, and a full audit trail capturing the reviewing admin, exact prompt, model + version, confidence score and approval history. The client could tune the review threshold or switch between full auto and mandatory manual review.
**R:** The business got high-throughput automation without losing control or traceability - high-confidence cases auto-applied, low-confidence ones routed to humans - which is why they were comfortable running it in daily production.
**Use for:** "How do you ensure quality?", "A time you balanced speed vs. correctness", "How do you approach AI responsibly?", "Designing for failure"

### 3. Learning PHP/Symfony/Shopware from scratch (learning agility)
**S:** My degree centred on C#/.NET and Java; WEXO's stack was PHP, Symfony and Shopware 6, which I had not worked in professionally.
**T:** I needed to become productive fast enough to deliver a business-critical system in a six-month internship.
**A:** I learned the stack on the job - Shopware's DAL, migrations, scheduled tasks and CLI, Symfony Messenger, Vue admin and TypeScript storefront - leaning on documentation, code reviews, pair programming and my mentor, and applying architecture principles I already knew to a new ecosystem.
**R:** I shipped a complex, production-grade plugin as sole developer. The WEXO partner's recommendation specifically highlighted my "ability and will to learn new complex areas," and the internship was graded 12 (A).
**Use for:** "How do you learn new technology?", "A time you were out of your depth", "You don't have experience with our stack"

### 4. Netto waste-reduction initiative (leadership, business impact)
**S:** As Sales Manager at Netto I saw recurring, avoidable waste driving real cost.
**T:** I took responsibility for reducing it while running daily operations and leading the team.
**A:** I led a waste-reduction initiative - tightening ordering, process and staff routines - and brought the team along through the change.
**R:** It saved approximately 1M DKK annually. Alongside it I recruited, developed staff and ran daily operations for a multi-year period.
**Use for:** "Tell me about a time you led", "Delivered measurable business impact", "Drove change / process improvement", "Working with non-technical people"

### 5. Email-template preview system (working in existing code, collaboration)
**S:** WEXO's content managers couldn't reliably validate transactional email templates - placeholders hid rendering problems against complex real orders.
**T:** I took over an existing implementation and turned it into a usable preview system on WEXO's Shopware platform.
**A:** I extended the Shopware admin email-template editor (Vue/Twig/SCSS): a `PreviewDataBuilder` service assembled realistic order/customer context and a `MailPreviewController` exposed preview and test-send endpoints, rendering against complex order structures (configurable products, options, nested line items) with emulated cross-client rendering logic.
**R:** It markedly simplified the content managers' workflow, reduced errors in customer-facing communication and improved deployment stability.
**Use for:** "Working in an existing/legacy codebase", "Improving another team's workflow", "A time you inherited someone else's code"

<!-- STAR CANDIDATES (optionally flesh out later): AutoApplicant and DevInsight (two separate
self-driven Java/Spring hexagonal projects), Sall Whisky rebuild (JavaFX -> Spring Boot + Angular rewrite = adapting a design),
Multiplayer Maze over raw TCP sockets (concurrency/networking fundamentals). -->

## Common Tough Questions

### "Why are you leaving retail / making the career change?"
> Be honest and forward-looking: I spent years in retail, growing into store leadership, but software is what I kept building toward - I taught myself, took the Datamatiker degree, and my internship confirmed it's where I do my best work. I bring the operational and leadership maturity from retail with me; I'm not starting from zero on responsibility, just focusing it on engineering.

### "You're early-career / you don't have much professional software experience."
> Acknowledge it plainly, then bridge to scope: my titles are junior/intern, but during my internship I owned a business-critical AI platform end-to-end as sole developer, in production and still in daily use. I back that with a steady stream of self-driven full-stack projects (AutoApplicant, DevInsight, MDB). The gap is years, not capability or ownership - and my WEXO reference speaks to exactly that.

### "You don't have experience with [our specific stack]."
> I've shipped production work in C#/.NET, Java/Spring and PHP/Symfony, and I learned the last of those from scratch on the job in one internship. I lean on fundamentals - architecture, testing, integrations - that transfer, and the WEXO partner specifically praised how quickly I pick up complex new areas. (Then name the closest adjacency in the profile.)

### "Where do you see yourself in 5 years?"
> Growing from strong backend engineer toward architecture and platform/distributed-systems work - the kind of technical ownership I already gravitate to - while staying hands-on. I'd like to be the person a team trusts with the hard, reliability-critical parts of the system.

### "What's your biggest weakness?"
> Genuine + mitigation: because I like owning things end-to-end, I can over-invest in getting a design right before shipping. I manage it deliberately now - I lean on confidence thresholds, code reviews and shipping in stages rather than polishing in isolation, which is exactly how the WEXO platform got to production on time.

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, tech stack, or team structure. Never give a generic answer. Good hooks for Christoffer: reliability/production-critical systems, backend/integration challenges, a real engineering culture with autonomy and code review, and interesting domain problems.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
