# Phase 3: The Scout - Data Acquisition

**Duration:** Weeks 5-6  
**Goal:** Build the data gathering agent with API integrations for web search, social media, and specialized OSINT sources.

---

## Prerequisites

- Phase 1 & 2 completed successfully
- API keys ready:
  - Tavily AI (web search)
  - HaveIBeenPwned (optional, has free tier)
  - WhoisXML (optional)
  - RapidAPI account (for social media APIs)

---

## Task 3.1: API Integration Layer

### Step 1: Install HTTP Client
```bash
npm install axios
```

### Step 2: Create Base API Client (`src/lib/apis/base-client.js`)
```javascript
import axios from 'axios';

/**
 * Base API client with rate limiting and error handling
 */
export class BaseApiClient {
  constructor(baseURL, apiKey, options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        ...options.headers,
      },
    });

    this.rateLimitDelay = options.rateLimitDelay || 1000;
    this.lastRequestTime = 0;
  }

  /**
   * Make rate-limited request
   * @param {string} method - HTTP method
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request data
   * @returns {Promise<any>}
   */
  async request(method, url, data = null) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }

    try {
      const response = await this.client.request({
        method,
        url,
        ...(data && { data }),
      });
      this.lastRequestTime = Date.now();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        return new Error('Invalid API key');
      }
      if (status === 429) {
        return new Error('Rate limit exceeded. Please wait and try again.');
      }
      if (status === 403) {
        return new Error('Access forbidden. Check your API permissions.');
      }
      return new Error(`API Error: ${error.response.data?.message || error.message}`);
    }
    return new Error(`Network Error: ${error.message}`);
  }

  async get(url, params = {}) {
    return this.request('GET', url, { params });
  }

  async post(url, data) {
    return this.request('POST', url, data);
  }
}
```

### Step 3: Create Tavily Client (`src/lib/apis/tavily-client.js`)
```javascript
import { BaseApiClient } from './base-client';

/**
 * Tavily AI Search Client
 * Real-time web search with AI-powered result extraction
 */
export class TavilyClient extends BaseApiClient {
  constructor(apiKey) {
    super('https://api.tavily.com', apiKey);
  }

  /**
   * Search the web
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    const response = await this.post('/search', {
      query,
      search_depth: options.depth || 'basic', // 'basic' or 'advanced'
      include_answer: true,
      include_raw_content: false,
      max_results: options.maxResults || 5,
      include_domains: options.includeDomains || [],
      exclude_domains: options.excludeDomains || [],
    });

    return {
      answer: response.answer,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
    };
  }
}
```

### Step 4: Create Social Media Intelligence Module (`src/lib/apis/social-intel.js`)
```javascript
import { BaseApiClient } from './base-client';

/**
 * Social Media Intelligence Aggregator
 * Searches across LinkedIn, Twitter, Facebook, Instagram, GitHub
 */
export class SocialIntelligence {
  constructor(apiKeys) {
    this.rapidApiKey = apiKeys.rapidapi;
    this.githubToken = apiKeys.github;
  }

  /**
   * Search LinkedIn profiles
   * @param {string} name - Person's name
   * @param {Object} filters - Location, company, etc.
   * @returns {Promise<Array>} LinkedIn profiles
   */
  async searchLinkedIn(name, filters = {}) {
    // Using RapidAPI's LinkedIn scraper
    const client = new BaseApiClient(
      'https://linkedin-data-api.p.rapidapi.com',
      null,
      {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com',
        },
      }
    );

    try {
      const results = await client.get('/search-people', {
        keywords: name,
        location: filters.location,
        company: filters.company,
      });

      return results.data.map((profile) => ({
        platform: 'linkedin',
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        company: profile.company,
        profileUrl: profile.url,
        photoUrl: profile.photo,
        connections: profile.connections,
      }));
    } catch (error) {
      console.error('LinkedIn search error:', error);
      return [];
    }
  }

  /**
   * Search Twitter/X profiles
   * @param {string} query - Search query (name, handle, etc.)
   * @returns {Promise<Array>} Twitter profiles
   */
  async searchTwitter(query) {
    // Using RapidAPI's Twitter scraper
    const client = new BaseApiClient(
      'https://twitter-api45.p.rapidapi.com',
      null,
      {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com',
        },
      }
    );

    try {
      const results = await client.get('/search', { query });

      return results.users?.map((user) => ({
        platform: 'twitter',
        username: user.screen_name,
        name: user.name,
        bio: user.description,
        location: user.location,
        followers: user.followers_count,
        following: user.friends_count,
        verified: user.verified,
        profileUrl: `https://twitter.com/${user.screen_name}`,
        photoUrl: user.profile_image_url_https,
        createdAt: user.created_at,
      })) || [];
    } catch (error) {
      console.error('Twitter search error:', error);
      return [];
    }
  }

  /**
   * Search GitHub profiles
   * @param {string} username - GitHub username or name
   * @returns {Promise<Object|null>} GitHub profile
   */
  async searchGitHub(username) {
    try {
      const headers = this.githubToken
        ? { Authorization: `token ${this.githubToken}` }
        : {};

      const client = new BaseApiClient('https://api.github.com', null, {
        headers,
      });

      // Search users
      const searchResults = await client.get('/search/users', {
        q: username,
        per_page: 5,
      });

      if (searchResults.items.length === 0) return null;

      // Get detailed info for top match
      const topMatch = searchResults.items[0];
      const userDetails = await client.get(`/users/${topMatch.login}`);

      return {
        platform: 'github',
        username: userDetails.login,
        name: userDetails.name,
        bio: userDetails.bio,
        location: userDetails.location,
        email: userDetails.email,
        company: userDetails.company,
        blog: userDetails.blog,
        followers: userDetails.followers,
        following: userDetails.following,
        publicRepos: userDetails.public_repos,
        profileUrl: userDetails.html_url,
        photoUrl: userDetails.avatar_url,
        createdAt: userDetails.created_at,
      };
    } catch (error) {
      console.error('GitHub search error:', error);
      return null;
    }
  }

  /**
   * Search Instagram profiles (limited without official API)
   * @param {string} username - Instagram username
   * @returns {Promise<Object|null>} Instagram profile
   */
  async searchInstagram(username) {
    // Using RapidAPI's Instagram scraper
    const client = new BaseApiClient(
      'https://instagram-scraper-api2.p.rapidapi.com',
      null,
      {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com',
        },
      }
    );

    try {
      const profile = await client.get('/v1/info', { username_or_id_or_url: username });

      return {
        platform: 'instagram',
        username: profile.data.username,
        name: profile.data.full_name,
        bio: profile.data.biography,
        followers: profile.data.follower_count,
        following: profile.data.following_count,
        posts: profile.data.media_count,
        verified: profile.data.is_verified,
        profileUrl: `https://instagram.com/${profile.data.username}`,
        photoUrl: profile.data.profile_pic_url,
      };
    } catch (error) {
      console.error('Instagram search error:', error);
      return null;
    }
  }

  /**
   * Aggregate search across all platforms
   * @param {string} name - Person's name
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Results from all platforms
   */
  async searchAll(name, options = {}) {
    const results = {
      linkedin: [],
      twitter: [],
      github: null,
      instagram: null,
    };

    // Run searches in parallel
    const [linkedin, twitter, github] = await Promise.allSettled([
      this.searchLinkedIn(name, options.linkedin || {}),
      this.searchTwitter(name),
      this.searchGitHub(name),
    ]);

    if (linkedin.status === 'fulfilled') results.linkedin = linkedin.value;
    if (twitter.status === 'fulfilled') results.twitter = twitter.value;
    if (github.status === 'fulfilled') results.github = github.value;

    // Instagram search if username is provided
    if (options.instagram?.username) {
      const instagram = await this.searchInstagram(options.instagram.username);
      results.instagram = instagram;
    }

    return results;
  }
}
```

### Step 5: Create HaveIBeenPwned Client (`src/lib/apis/hibp-client.js`)
```javascript
import { BaseApiClient } from './base-client';

/**
 * HaveIBeenPwned API Client
 * Check if email/username appears in data breaches
 */
export class HIBPClient extends BaseApiClient {
  constructor(apiKey) {
    super('https://haveibeenpwned.com/api/v3', apiKey, {
      headers: {
        'hibp-api-key': apiKey,
        'user-agent': 'AegisOSINT',
      },
    });
  }

  /**
   * Check if email appears in breaches
   * @param {string} email - Email address
   * @returns {Promise<Array>} List of breaches
   */
  async checkEmail(email) {
    try {
      const breaches = await this.get(`/breachedaccount/${encodeURIComponent(email)}`);
      return breaches.map((breach) => ({
        name: breach.Name,
        title: breach.Title,
        domain: breach.Domain,
        breachDate: breach.BreachDate,
        addedDate: breach.AddedDate,
        dataClasses: breach.DataClasses,
        description: breach.Description,
        isVerified: breach.IsVerified,
        isSensitive: breach.IsSensitive,
      }));
    } catch (error) {
      if (error.message.includes('404')) {
        return []; // No breaches found
      }
      throw error;
    }
  }

  /**
   * Check if password has been exposed
   * @param {string} password - Password to check (will be hashed)
   * @returns {Promise<number>} Number of times password appeared in breaches
   */
  async checkPassword(password) {
    // Use k-anonymity model (only send first 5 chars of SHA-1 hash)
    const crypto = window.crypto || window.msCrypto;
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    
    const prefix = hashHex.substring(0, 5).toUpperCase();
    const suffix = hashHex.substring(5).toUpperCase();

    const client = new BaseApiClient('https://api.pwnedpasswords.com', null);
    const response = await client.get(`/range/${prefix}`);
    
    const lines = response.split('\n');
    for (const line of lines) {
      const [hash, count] = line.split(':');
      if (hash === suffix) {
        return parseInt(count, 10);
      }
    }
    return 0;
  }
}
```

### Step 6: Create GitHub Patch Trick Module (`src/lib/osint/github-patch.js`)
```javascript
/**
 * GitHub Patch Trick - Extract private emails from commit patches
 */
export class GitHubPatchExtractor {
  constructor(githubToken = null) {
    this.token = githubToken;
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Extract email from GitHub user's commits
   * @param {string} username - GitHub username
   * @returns {Promise<Array<{email: string, name: string, confidence: number}>>}
   */
  async extractEmails(username) {
    try {
      // Get user's repositories
      const repos = await this.getUserRepos(username);
      if (repos.length === 0) {
        return [];
      }

      // Get recent commits from top repos (by stars)
      const topRepos = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);

      const emails = new Set();
      const emailData = [];

      for (const repo of topRepos) {
        const commits = await this.getRepoCommits(repo.owner.login, repo.name, username);
        
        for (const commit of commits.slice(0, 10)) {
          // Fetch .patch file
          const patchUrl = `${commit.html_url}.patch`;
          const patchContent = await this.fetchPatch(patchUrl);
          
          // Extract email from patch
          const email = this.parseEmailFromPatch(patchContent);
          if (email && !emails.has(email)) {
            emails.add(email);
            emailData.push({
              email,
              name: commit.commit.author.name,
              confidence: this.calculateConfidence(email, username),
              source: patchUrl,
              commitDate: commit.commit.author.date,
            });
          }
        }
      }

      return emailData;
    } catch (error) {
      console.error('GitHub patch extraction error:', error);
      return [];
    }
  }

  async getUserRepos(username) {
    const headers = this.token ? { Authorization: `token ${this.token}` } : {};
    const response = await fetch(`${this.baseUrl}/users/${username}/repos?per_page=100`, {
      headers,
    });
    return response.json();
  }

  async getRepoCommits(owner, repo, author) {
    const headers = this.token ? { Authorization: `token ${this.token}` } : {};
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/commits?author=${author}&per_page=20`,
      { headers }
    );
    return response.json();
  }

  async fetchPatch(url) {
    const response = await fetch(url);
    return response.text();
  }

  parseEmailFromPatch(patchContent) {
    // Extract email from "From: Name <email@domain.com>" line
    const match = patchContent.match(/From:.*?<(.+?)>/);
    return match ? match[1] : null;
  }

  calculateConfidence(email, username) {
    // Higher confidence if email contains username
    if (email.toLowerCase().includes(username.toLowerCase())) {
      return 95;
    }
    // Medium confidence for personal domains
    if (email.match(/@(gmail|yahoo|outlook|hotmail|protonmail)\./)) {
      return 85;
    }
    // Lower confidence for corporate/generic emails
    return 70;
  }
}
```

---

## Task 3.2: The Scout Agent

### Step 1: Create The Scout (`src/agents/scout.js`)
```javascript
import { TavilyClient } from '../lib/apis/tavily-client';
import { SocialIntelligence } from '../lib/apis/social-intel';
import { HIBPClient } from '../lib/apis/hibp-client';
import { GitHubPatchExtractor } from '../lib/osint/github-patch';
import { getApiKey } from '../lib/utils/storage';

/**
 * The Scout - Data Acquisition Agent
 * Executes searches across multiple OSINT sources
 */
export class ScoutAgent {
  constructor() {
    this.tavily = null;
    this.socialIntel = null;
    this.hibp = null;
    this.githubPatch = null;
  }

  /**
   * Initialize all API clients
   */
  async initialize() {
    const apiKeys = {
      tavily: await getApiKey('tavily'),
      rapidapi: await getApiKey('rapidapi'),
      github: await getApiKey('github'),
      hibp: await getApiKey('hibp'),
    };

    if (apiKeys.tavily) {
      this.tavily = new TavilyClient(apiKeys.tavily);
    }

    if (apiKeys.rapidapi || apiKeys.github) {
      this.socialIntel = new SocialIntelligence(apiKeys);
    }

    if (apiKeys.hibp) {
      this.hibp = new HIBPClient(apiKeys.hibp);
    }

    this.githubPatch = new GitHubPatchExtractor(apiKeys.github);
  }

  /**
   * Execute comprehensive search for a target
   * @param {Object} target - Target information
   * @returns {Promise<Object>} Aggregated results
   */
  async investigate(target) {
    if (!this.tavily && !this.socialIntel) {
      await this.initialize();
    }

    const results = {
      web: null,
      social: null,
      breaches: null,
      github: null,
      timestamp: Date.now(),
    };

    // Web search
    if (this.tavily && target.name) {
      results.web = await this.searchWeb(target.name, target.context);
    }

    // Social media search
    if (this.socialIntel && target.name) {
      results.social = await this.socialIntel.searchAll(target.name, {
        linkedin: {
          location: target.location,
          company: target.company,
        },
        instagram: {
          username: target.instagram,
        },
      });
    }

    // Breach check
    if (this.hibp && target.email) {
      results.breaches = await this.hibp.checkEmail(target.email);
    }

    // GitHub email extraction
    if (target.github) {
      results.github = await this.githubPatch.extractEmails(target.github);
    }

    return results;
  }

  async searchWeb(query, context = '') {
    const fullQuery = context ? `${query} ${context}` : query;
    return await this.tavily.search(fullQuery, { maxResults: 10 });
  }
}
```

### Step 2: Update Settings Modal for New API Keys (`src/sidepanel/components/SettingsModal.jsx`)

Add these fields to the settings modal:

```javascript
// Add to apiKeys state
const [apiKeys, setApiKeys] = useState({
  gemini: '',
  tavily: '',
  rapidapi: '', // NEW
  github: '',   // NEW
  hibp: '',
  whois: '',
});

// Add to the form (after Tavily field):
<div>
  <label className="block text-sm font-medium mb-2">
    RapidAPI Key
  </label>
  <input
    type="password"
    value={apiKeys.rapidapi}
    onChange={(e) =>
      setApiKeys({ ...apiKeys, rapidapi: e.target.value })
    }
    placeholder="Optional"
    className="input-field w-full"
  />
  <p className="text-xs text-aegis-text-muted mt-1">
    Required for LinkedIn, Twitter, Instagram searches.{' '}
    <a
      href="https://rapidapi.com/hub"
      target="_blank"
      rel="noopener noreferrer"
      className="text-aegis-primary hover:underline"
    >
      Get API key
    </a>
  </p>
</div>

<div>
  <label className="block text-sm font-medium mb-2">
    GitHub Personal Access Token
  </label>
  <input
    type="password"
    value={apiKeys.github}
    onChange={(e) =>
      setApiKeys({ ...apiKeys, github: e.target.value })
    }
    placeholder="ghp_..."
    className="input-field w-full"
  />
  <p className="text-xs text-aegis-text-muted mt-1">
    Optional. Increases rate limits for GitHub searches.
  </p>
</div>
```

---

## Task 3.3: Integrate Scout with Inquisitor

### Update Inquisitor to Call Scout (`src/agents/inquisitor.js`)

```javascript
import { ScoutAgent } from './scout';

export class InquisitorAgent {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
    this.scout = new ScoutAgent(); // ADD THIS
  }

  async processQuery(userMessage, onChunk, onComplete) {
    // ... existing code ...

    // Check if this is a search request
    const intent = this.classifyIntent(userMessage);
    
    if (intent === 'search') {
      // Extract target info from query
      const target = this.extractTargetInfo(userMessage);
      
      // Call The Scout
      onChunk('\n\n🔍 Initiating search across multiple sources...\n\n');
      
      try {
        const scoutResults = await this.scout.investigate(target);
        
        // Format results for LLM
        const resultsContext = this.formatScoutResults(scoutResults);
        
        // Add results to conversation
        messages.push({
          role: 'system',
          content: `OSINT Results:\n${resultsContext}`,
        });
      } catch (error) {
        console.error('Scout error:', error);
        onChunk(`⚠️ Search encountered an error: ${error.message}\n\n`);
      }
    }

    // Continue with LLM response...
  }

  extractTargetInfo(query) {
    // Simple extraction (can be enhanced with NLP)
    const target = { name: '' };
    
    // Extract name (words after "find", "search", "investigate")
    const match = query.match(/(?:find|search|investigate)\s+(.+?)(?:\s+in|\s+at|$)/i);
    if (match) {
      target.name = match[1].trim();
    }
    
    // Extract location
    const locationMatch = query.match(/(?:in|from|located|based)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (locationMatch) {
      target.location = locationMatch[1];
    }
    
    return target;
  }

  formatScoutResults(results) {
    let formatted = '';
    
    if (results.social?.linkedin?.length > 0) {
      formatted += '**LinkedIn Profiles:**\n';
      results.social.linkedin.forEach((profile, i) => {
        formatted += `${i + 1}. ${profile.name} - ${profile.headline}\n`;
        formatted += `   Location: ${profile.location}\n`;
        formatted += `   URL: ${profile.profileUrl}\n\n`;
      });
    }
    
    if (results.social?.twitter?.length > 0) {
      formatted += '**Twitter/X Profiles:**\n';
      results.social.twitter.forEach((profile, i) => {
        formatted += `${i + 1}. @${profile.username} - ${profile.name}\n`;
        formatted += `   Bio: ${profile.bio}\n`;
        formatted += `   Followers: ${profile.followers}\n\n`;
      });
    }
    
    if (results.social?.github) {
      formatted += '**GitHub Profile:**\n';
      formatted += `Username: ${results.social.github.username}\n`;
      formatted += `Name: ${results.social.github.name}\n`;
      formatted += `Repos: ${results.social.github.publicRepos}\n\n`;
    }
    
    if (results.github?.length > 0) {
      formatted += '**Extracted Emails (GitHub Patch Trick):**\n';
      results.github.forEach((item) => {
        formatted += `- ${item.email} (${item.confidence}% confidence)\n`;
      });
      formatted += '\n';
    }
    
    if (results.breaches?.length > 0) {
      formatted += '**Data Breaches:**\n';
      results.breaches.forEach((breach) => {
        formatted += `- ${breach.name} (${breach.breachDate})\n`;
        formatted += `  Data exposed: ${breach.dataClasses.join(', ')}\n`;
      });
    }
    
    return formatted || 'No results found from external sources.';
  }
}
```

---

## Testing & Validation

### Test Case 1: LinkedIn Search
```
User: "Find John Smith who works at Microsoft in Seattle"
Expected: LinkedIn profiles matching criteria
```

### Test Case 2: GitHub Patch Trick
```
User: "Extract email for GitHub user torvalds"
Expected: Linus Torvalds' commit email addresses
```

### Test Case 3: Multi-Platform Search
```
User: "Investigate @elonmusk"
Expected: Twitter, GitHub profiles + any breach data
```

### Test Case 4: Breach Check
```
User: "Check if test@example.com has been in any breaches"
Expected: List of breaches (if any)
```

---

## Deliverables Checklist

- [x] Base API client with rate limiting
- [x] Tavily integration
- [x] Social media intelligence (LinkedIn, Twitter, GitHub, Instagram)
- [x] HaveIBeenPwned integration
- [x] GitHub Patch Trick implementation
- [x] Scout agent coordinating all sources
- [x] Integration with Inquisitor
- [x] Settings UI for new API keys

---

## Success Criteria

✅ Can search LinkedIn profiles with filters  
✅ Can search Twitter/X accounts  
✅ Can extract GitHub emails via .patch trick  
✅ Can check email breaches  
✅ Scout returns aggregated results  
✅ Inquisitor presents results in chat  
✅ All API errors handled gracefully  

---

## Next Steps

Proceed to **Phase 4: The Auditor** to implement verification and conflict detection for the gathered data.
