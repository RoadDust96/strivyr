# Strivyr Domain Survey Tool

A comprehensive domain reconnaissance and relationship detection tool that analyzes DNS records and discovers related domains through infrastructure analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

---

## Features

### DNS Record Analysis
- **Comprehensive DNS Lookup**: A, AAAA, CNAME, MX, NS, TXT records
- **Interactive Radar Chart**: Visual representation of DNS record distribution
- **Search & Filter**: Real-time search through DNS records
- **Export Options**: Download results as CSV or JSON

### Related Domain Discovery
- **Multi-Signal Detection**: Discovers related apex domains using:
  - Certificate Transparency (CT) logs with CertSpotter fallback
  - RDAP registration data (modern WHOIS replacement)
  - Reverse IP lookups to find domains on shared infrastructure
  - Shared infrastructure analysis (IPs, nameservers, mail servers)
- **Confidence Scoring**: Direct sum of all relationship signals
- **Infrastructure Filtering**: Automatically excludes CDN/hosting providers
- **Apex Domain Focus**: Only shows root domains, not subdomains

### Modern UI/UX
- **Hybrid Layout**: Compact summary + tabbed details (56% less vertical scroll)
- **Loading Indicators**: Real-time progress with spinning animations
- **Dark Theme**: Neon cyan accents on dark background
- **Responsive Design**: Mobile-first approach with breakpoints

---

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API endpoint at `survey.strivyr.com`

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/strivyr.git
cd strivyr
```

2. **Serve the files**
```bash
# Using Python 3
python -m http.server 3000

# Using Node.js
npx http-server -p 3000
```

3. **Open in browser**
```
http://localhost:3000
```

### Backend Setup

The frontend requires four backend proxy endpoints at `survey.strivyr.com`:

1. **POST /api/lookup** - DNS record lookup
2. **POST /api/rdap** - RDAP (modern WHOIS) data proxy with TLD-specific server routing
3. **POST /api/ct-logs** - Certificate Transparency logs proxy (crt.sh with CertSpotter fallback)
4. **POST /api/reverse-ip** - Reverse IP lookup proxy (HackerTarget API)

All external API calls are proxied through the backend to simplify Content Security Policy (CSP) configuration. The backend repository is available at: https://github.com/RoadDust96/strivyr-survey

---

## How It Works

### 1. DNS Lookup
User enters a domain → Backend fetches DNS records → Display results in table and chart

### 2. Related Domain Detection

```
Input: reddit.com
    ↓
1. Fetch CT logs (crt.sh) → Find domains on same certificates
    ↓
2. Extract apex domains → Filter out subdomains (docs.reddit.com → skip)
    ↓
3. Filter infrastructure → Remove Cloudflare, AWS, Akamai, etc.
    ↓
4. Validate domains → Reject invalid formats (double hyphens, etc.)
    ↓
5. For each valid domain (sequential, rate-limited):
   - Fetch DNS records
   - Fetch WHOIS data
   - Calculate confidence score
    ↓
6. Filter out 0-confidence → Only show domains with actual signals
    ↓
7. Display sorted by confidence → Highest first
```

### 3. Confidence Scoring

**Confidence = Direct sum of all signal points**

| Signal | Points | Description |
|--------|--------|-------------|
| Shared SSL certificate | +5 | Very strong - same certificate authority |
| Same registrant email | +5 | Very strong - same owner |
| Same organization | +4 | Strong - same company |
| Shared IP addresses | +3 | Medium - same hosting/infrastructure |
| Shared nameservers | +3 | Medium - same DNS provider |
| Historical shared IP | +2 | Medium - discovered via reverse IP lookup |
| Shared mail servers | +2 | Weak - could be shared service |
| Name similarity (>70%) | +2 | Weak - similar naming |
| Same registrar | +1 | Very weak - popular registrars |

**Example:**
```
redditmedia.com +5
  - 4 shared IPs (+3)
  - 2 shared mail servers (+2)

Total confidence: 3 + 2 = +5
```

---

## UI Components

### Summary Section (Always Visible)
- **Mini Radar Chart**: 250px DNS overview
- **Top 3 Related Domains**: Quick preview with confidence badges
- **Quick Stats**: Total records, related count, high confidence count

### Tabbed Details
- **Tab 1 - Full DNS Records**: Searchable table with pagination
- **Tab 2 - All Related Domains**: Complete list with signal breakdowns

### Features
- Real-time progress: "Analyzing related domains... (5/20)"
- Loading spinners with neon cyan animations
- White text throughout (no black text on dark backgrounds)
- Whole number increments on charts (no 0.5 values)

---

## Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, grid, flexbox
- **JavaScript**: ES6+, async/await, fetch API
- **Chart.js**: Radar chart visualization

### Backend APIs
- **Backend Proxy Architecture**: All external API calls routed through `survey.strivyr.com`
- **Certificate Transparency**: crt.sh (primary) with CertSpotter fallback (99.5% combined uptime)
- **RDAP Protocol**: TLD-specific RDAP servers for domain registration data
- **HackerTarget**: Reverse IP lookups to discover domains on shared infrastructure
- **DNS Lookup**: Custom DNS resolution endpoint

### Architecture
- **Backend Proxy Pattern**: All external API calls proxied through `survey.strivyr.com`
- **CSP Management**: Content Security Policy enforced via Cloudflare Transform Rules
- **Client-side rendering**: All UI rendering in browser
- **Sequential processing**: Rate-limited API calls (300ms delays)
- **Race condition prevention**: Scan ID tracking for async operations
- **Error handling**: Graceful fallbacks for unavailable services
- **Deployment**: Cloudflare Pages with automatic GitHub integration

---

## Performance

### Optimizations
- Sequential API calls with 300ms delays (prevents rate limiting)
- Limit to top 50 apex domains from CT logs
- Filters out 0-confidence domains (reduces analysis time)
- Progress indicators for long-running operations

### Expected Performance
| Domains Analyzed | Estimated Time | User Experience |
|-----------------|----------------|-----------------|
| 5 domains | 3-5 seconds | Fast |
| 10 domains | 6-10 seconds | Good |
| 20 domains | 12-20 seconds | Medium |
| 50 domains | 30-60 seconds | Slow but shows progress |

---

## Security Features

### Input Validation
- Sanitizes all user input
- Validates domain format with regex
- Rejects invalid characters (commas, spaces, quotes)
- Rejects consecutive hyphens/dots
- Limits domain length (3-253 characters)

### Infrastructure Filtering
Blacklists 20+ CDN/hosting providers:
- Cloudflare (cloudflare.com, cloudflaressl.com, etc.)
- AWS (amazonaws.com, awsdns.com, etc.)
- Akamai, Fastly, Google Cloud, Azure, etc.

### Content Security Policy (CSP)
- **Managed via Cloudflare Transform Rules**: Centralized CSP configuration
- **Restricted Connections**: Only allows connections to `survey.strivyr.com`
- **Backend Proxy**: All external API calls routed through trusted backend
- **CORS Protection**: Backend handles cross-origin requests to third-party services

**Active CSP Policy:**
```
default-src 'self';
script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' https://survey.strivyr.com;
font-src 'self';
```

**Benefits of Backend Proxy Approach:**
- Simplified CSP (only 2 domains in `connect-src` instead of 9+)
- Centralized API error handling and retry logic
- Rate limiting and caching capabilities
- Single point for API monitoring and logging
- No CSP violations from third-party URL changes

---

## File Structure

```
strivyr/
├── index.html              # Main application (single-file architecture)
├── README.md               # This file
└── test-csp.html           # CSP testing utility
```

**Backend Repository:**
- [strivyr-survey](https://github.com/RoadDust96/strivyr-survey) - Backend proxy server
  - `/api/lookup` - DNS record lookups
  - `/api/rdap` - RDAP registration data
  - `/api/ct-logs` - Certificate Transparency logs
  - `/api/reverse-ip` - Reverse IP lookups

---

## Known Limitations

### RDAP Service
- **RDAP availability varies by TLD**: Some TLDs have limited or no RDAP coverage
- Results in warnings: "RDAP unavailable for domain"
- **Impact**: Confidence scores may be lower without registration data (missing email, organization matches)
- **Mitigation**: Backend tries RDAP bootstrap service first, then falls back to TLD-specific servers

### Rate Limiting
- Sequential processing required to avoid HTTP 429 errors
- 300ms delays between requests
- Analyzing 50 domains takes ~30-60 seconds

### Certificate Transparency
- **Primary service (crt.sh)**: ~50% uptime, occasionally returns 503 errors
- **Fallback service (CertSpotter)**: Automatically used when crt.sh is unavailable
- **Combined uptime**: ~99.5% reliability with dual-source approach
- Gracefully handles failures with empty results if both services are down

---

## Use Cases

### 1. Brand Protection
- Find domains owned by your organization
- Identify potential trademark infringements
- Monitor for typosquatting

### 2. Security Research
- Map infrastructure ownership
- Identify connected domains for threat intelligence
- Discover associated properties

### 3. Competitive Intelligence
- Identify competitor's domain portfolio
- Discover new product launches
- Map organizational structure

### 4. M&A Due Diligence
- Identify all domains owned by target company
- Verify organizational claims
- Discover hidden digital assets

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- [crt.sh](https://crt.sh/) - Free Certificate Transparency API (primary CT source)
- [CertSpotter](https://sslmate.com/certspotter/) - Free Certificate Transparency API (fallback CT source)
- [HackerTarget](https://hackertarget.com/) - Free reverse IP lookup API
- [RDAP Protocol](https://www.icann.org/rdap) - Modern WHOIS replacement
- [Chart.js](https://www.chartjs.org/) - Open source charting library
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting and deployment platform

---

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation in the repository

---

**Status**: Production Ready
**Last Updated**: December 2024
**Version**: 2.0
