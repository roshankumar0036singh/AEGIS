# Project Proposal: AegisOSINT

**Project Code:** AEGIS-2026-EXT  
**Subject:** Autonomous Agentic OSINT Investigation Framework  
**Date:** January 18, 2026  
**Status:** Technical Specification (Refined)

---

## 1. Executive Summary

**AegisOSINT** is a next-generation browser extension designed to automate complex Open Source Intelligence (OSINT) investigations through a local-first, Agentic AI Architecture. Unlike traditional scraping tools, AegisOSINT functions as a digital private investigator—capable of reasoning, planning, cross-verifying, and engaging in "Active Task Disambiguation" with the user.

By utilizing a "Human-in-the-Loop" protocol and local LLM capabilities (where possible) or BYOK (Bring Your Own Key) cloud models, the tool ensures 100% data sovereignity, minimizes hallucinations, and produces legally admissible intelligence.

## 2. Problem Statement

Current OSINT tools face significant bottlenecks:
1.  **Data Overload & Noise:** Broad searches yield thousands of potential matches (e.g., "John Doe") with no automated context filtering.
2.  **High Latency & Manual Correlation:** Investigators must manually switch between tabs (Social Media, Breach DBs, Corporate Registries) and copy-paste data to map relationships.
3.  **Hallucination & False Positives:** Standard GenAI tools invent connections. A single wrong link can compromise an entire investigation.
4.  **Operational Security (OPSEC) Risks:** Clumsy automated scrapers trigger anti-bot defenses or alert targets to surveillance.

**The Solution:** AegisOSINT deploys specialized AI agents that mimic the workflow of a senior intelligence analyst: gathering, verifying, mapping, and refining.

## 3. System Architecture

The tool is built on a Multi-Agent Orchestration model within a **Chrome Manifest V3** environment, ensuring compliance with modern browser security standards while maintaining powerful capabilities.

### 3.1 Agent Roles (The Agency)

*   **🕵️ The Inquisitor (Mission Control & UX):**
    *   Manages the natural language chat interface.
    *   Parses user intent and formulates investigation plans.
    *   *New:* Detects when a query is too broad and triggers "Refinement Loops" (e.g., "I found targets in 3 jurisdictions. Which one are we focusing on?").

*   **🐕 The Scout (Data Acquisition):**
    *   Executes technical searches across indexed APIs & Surface Web.
    *   *Tools:* Tavily, Google Dorking, Shodan, WhoisXML, HaveIBeenPwned.
    *   *Stealth:* Rotates user-agents and manages request throttling to appear human.

*   **⚖️ The Auditor (Verification & Fact-Checking):**
    *   The "Skeptic" engine. It compares data points from The Scout.
    *   Flags "Conflict Alerts" (e.g., "LinkedIn says location is NY, but Twitter Geotag says London").
    *   Calculates a confidence score (0-100%) for every assertion.

*   **🗺️ The Cartographer (Visualization):**
    *   Builds a dynamic, interactive Knowledge Graph.
    *   Links nodes (Entities) with edges (Relationships, e.g., "Used Same IP", "Registered Domain").

*   **📦 The Archivist (Evidence & Preservation):** *(New)*
    *   Automatically captures cryptographic snapshots of web pages.
    *   Hashes content (SHA-256) to ensure data integrity/chain of custody for potential legal use.

## 4. Key Features

### 4.1 Active Task Disambiguation
Instead of guessing, the AI pauses to ask clarifying questions.
*   *Scenario:* User interprets "Find Robert Smith."
*   *Agent:* "I've identified: [Robert Smith - Musician], [Robert Smith - Senator], [Robert Smith - CEO]. Please select the correct profile to proceed."

### 4.2 Side Panel Graph Visualization
A live-updating Network Graph (D3.js/Cytoscape) residing in the browser side panel.
*   **Drag-and-Drop:** Users can drag text/images from a webpage into the graph to manually create nodes.
*   **Auto-Expansion:** Clicking a node (e.g., an Email) triggers a sub-investigation to find related leaks or accounts.

### 4.3 Automated Evidence Log & Reporting
*   **Chain of Custody:** Every finding is linked to a specific URL, timestamp, and screenshot.
*   **One-Click Report:** Export the entire investigation as a PDF dossier or JSON structure (STIX format compatible) for threat intelligence platforms.

### 4.4 Privacy-First & Local Memory
*   **Local Vector Store:** Uses `IndexedDB` + lightweight client-side embeddings (e.g., TensorFlow.js or ONNX) to store "Memory" locally.
*   **Data Sovereignty:** No investigation data is sent to Aegis servers. Only the LLM provider (via BYOK) sees the prompt text.

### 4.5 Advanced OPSEC (Stealth Mode)
*   User-Agent Rotation & Canvas Fingerprinting Noise.
*   "Passive Mode": Only analyzes content the user manually browses (no active fetching) to prevent triggering logs.

### 4.6 Advanced Tradecraft: The "Patch" Trick
A specialized module within "The Scout" designed to unmask private email addresses from GitHub profiles.
*   **The Technique:** Automatically appends `.patch` to recent commits in a target's GitHub repository.
*   **Extraction:** Parses the raw patch metadata to extract the "Committer Email," often revealing personal addresses (e.g., `user@gmail.com`) even when the profile email is set to private.
*   **Verification Loop:** The extracted email is immediately cross-referenced by "The Auditor" against known aliases to confirm identity.

### 4.7 Precision & Accuracy Enhancements
To achieve 100% confidence, AegisOSINT employs advanced verification layers:
*   **Stylometric Fingerprinting (The Linguist):** Uses NLP to analyze writing patterns (vocabulary, punctuation, phrasing) across discovered accounts. If "UserA" on Reddit and "UserB" on a forum claim to be different but share a 95% linguistic match, the system flags a potential alias.
*   **Historical Resonance & "Time Travel":** Current Whois/DNS data is often redacted. The system queries historical records (Passive DNS) to find the *original* registrant details from years ago, often revealing the true owner before privacy screens were active.
*   **Social Graph Validation:** Verifies a target's employment claims by analyzing 2nd-degree connections (e.g., "Does this target have mutual connections with other verified employees of the claimed company?").

### 4.8 Multi-Language & Translation Layer
Global investigations require cross-border intelligence capabilities:
*   **Auto-Detection & Translation:** Automatically detects content language and translates to user's preferred language using embedded translation APIs (Google Translate, DeepL).
*   **Cultural Context Awareness:** Recognizes region-specific platforms (VK for Russia, Weibo for China, Telegram channels) and adjusts search strategies accordingly.
*   **Script Recognition:** Handles Cyrillic, Arabic, Chinese, and other non-Latin scripts in usernames, handles, and content analysis.
*   **Transliteration Engine:** Converts names across alphabets (e.g., "Иван Петров" → "Ivan Petrov") to enable cross-platform matching.

### 4.9 Image Intelligence (IMINT) Module
Visual evidence is critical for modern investigations:
*   **Reverse Image Search:** Automated parallel queries across Google Images, Yandex, TinEye, and Bing Visual Search to find all instances of a photo.
*   **EXIF Data Extraction:** Automatically extracts and displays GPS coordinates, camera models, timestamps, and software metadata from uploaded images.
*   **Geolocation from Visual Clues:** Uses AI vision models to identify landmarks, street signs, architectural styles, and environmental features to pinpoint photo locations.
*   **Image Similarity Clustering:** Groups visually similar images to identify photo sets from the same source/event.
*   **Screenshot Verification:** Detects if images have been digitally manipulated or are screenshots of other content.

### 4.10 Dark Web Monitoring
Extends investigations beyond the surface web:
*   **Tor Integration:** Searches .onion sites via specialized search engines (Ahmia, Torch, Haystak) with built-in anonymization.
*   **Breach Database Correlation:** Cross-references target emails/usernames against known data dumps (HaveIBeenPwned API, IntelX).
*   **Paste Site Monitoring:** Auto-scans Pastebin, GitHub Gists, and similar platforms for leaked credentials or sensitive information.
*   **Dark Web Marketplace Surveillance:** Monitors underground forums and marketplaces for mentions of target entities (requires ethical use policies).
*   **Credential Stuffing Detection:** Identifies if target credentials appear in credential dumps or are being actively traded.

### 4.11 Temporal Analysis Engine
A competitive differentiator that transforms scattered data into actionable intelligence timelines:
*   **Automated Timeline Construction:** Aggregates all discovered activities (posts, commits, registrations, logins) into a unified chronological view with interactive filtering.
*   **Pattern Detection & Behavioral Profiling:** Identifies recurring patterns such as posting times, activity bursts, dormant periods, and timezone shifts that reveal location or lifestyle changes.
*   **Anomaly Detection:** Flags unusual activity (e.g., "Target typically posts 9-5 EST, but suddenly active at 3 AM PST—possible travel or account compromise").
*   **Predictive Modeling:** Uses historical patterns to forecast likely future activity windows, optimal engagement times, or next expected actions.
*   **Event Correlation:** Cross-references target's timeline with external events (company announcements, geopolitical incidents) to identify causation or motivation.
*   **Gap Analysis:** Highlights suspicious periods of inactivity that may indicate operational security measures or alternate identities.

## 5. Technical Stack

| Component | Technology |
| :--- | :--- |
| **Extension Framework** | Chrome Manifest V3, Vite, JavaScript (JSX) |
| **UI Components** | React 19, Tailwind CSS, Shadcn/UI, Lucide Icons |
| **Agent Orchestration** | LangGraph.js / LangChain.js |
| **LLM Interface** | Vercel AI SDK (with support for Gemini, GPT-4, Claude) |
| **Local Database** | PGlite (WASM Postgres) or RxDB (IndexedDB wrapper) |
| **Visualization** | React Flow or Cytoscape.js |
| **Search Providers** | Tavily AI, Google Custom Search API |
| **Enrichment** | OSINT.sh, Shodan, WhoisXML |

## 6. Security & Ethics

*   **BYOK (Bring Your Own Key):** Users provide their own keys for API services (OpenAI, Tavily, Shodan), preventing abuse and managing costs.
*   **Defanging Logic:** Malicious URLs/IPs are automatically "defanged" (e.g., `example[.]com`) in the UI to prevent accidental clicks.
*   **Rate & Budget Limits:** Users can set maximum spend/request limits per investigation.

## 7. Project Roadmap

### Phase 1: Foundation (Weeks 1-2)
*   [ ] Initialize Manifest V3 + React + Vite boilerplate with JavaScript.
*   [ ] Build the "Inquisitor" Chat Interface (Side Panel).
*   [ ] Implement basic State Management (Zustand) for chat history.

### Phase 2: Agent Capabilities (Weeks 3-5)
*   [ ] Integrate LLM Streaming (Gemini/OpenAI). use gemini
*   [ ] Build "The Scout" with Tavily API integration.
*   [ ] Implement "Active Disambiguation" UI flows.

### Phase 3: Visualization & Memory (Weeks 6-8)
*   [ ] Integrate Graph Visualization (React Flow).
*   [ ] Implement Local Vector/Document Storage (IndexedDB).
*   [ ] Develop "The Auditor" verification logic.

### Phase 4: Polish & Advanced Features (Weeks 9-10)
*   [ ] "The Archivist" snapshotting & PDF reporting.
*   [ ] Advanced OPSEC settings.
*   [ ] Release Candidate testing.

## 8. Conclusion

AegisOSINT transforms the browser from a passive viewing tool into an active intelligence partner. By maintaining strict "Human-in-the-Loop" validation while automating the tedious data gathering, it creates a new standard for accuracy and efficiency in digital investigations.
