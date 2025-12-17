# Strivyr Domain Survey Tool

A comprehensive domain reconnaissance and relationship detection tool that analyzes DNS records and discovers related domains through infrastructure analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

---

## 🎯 Features

### DNS Record Analysis
- **Comprehensive DNS Lookup**: A, AAAA, CNAME, MX, NS, TXT records
- **Interactive Radar Chart**: Visual representation of DNS record distribution
- **Search & Filter**: Real-time search through DNS records
- **Export Options**: Download results as CSV or JSON

### Related Domain Discovery
- **Multi-Signal Detection**: Discovers related apex domains using:
  - Certificate Transparency (CT) logs
  - WHOIS registration data
  - Shared infrastructure (IPs, nameservers, mail servers)
- **Confidence Scoring**: Direct sum of all relationship signals
- **Infrastructure Filtering**: Automatically excludes CDN/hosting providers
- **Apex Domain Focus**: Only shows root domains, not subdomains

### Modern UI/UX
- **Hybrid Layout**: Compact summary + tabbed details (56% less vertical scroll)
- **Loading Indicators**: Real-time progress with spinning animations
- **Dark Theme**: Neon cyan accents on dark background
- **Responsive Design**: Mobile-first approach with breakpoints

---

## 🚀 Quick Start

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

The frontend requires three backend endpoints:

1. **POST /api/lookup** - DNS record lookup
2. **POST /api/whois** - WHOIS data proxy (bypasses CORS)
3. **POST /api/ct-logs** - Certificate Transparency logs proxy

See [BACKEND_FILTERING_FIX.md](BACKEND_FILTERING_FIX.md) for complete endpoint specifications.

---

## 📖 How It Works

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

## 🎨 UI Components

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

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, grid, flexbox
- **JavaScript**: ES6+, async/await, fetch API
- **Chart.js**: Radar chart visualization

### Backend APIs (Required)
- **crt.sh**: Certificate Transparency logs (free, unlimited)
- **Who-Dat**: WHOIS data (free, may be rate-limited on cloud hosting)
- **Your DNS API**: Custom DNS lookup endpoint

### Architecture
- **Client-side rendering**: All UI rendering in browser
- **Sequential processing**: Rate-limited API calls (300ms delays)
- **Error handling**: Graceful fallbacks for unavailable services

---

## 📊 Performance

### Optimizations
- Sequential API calls with 300ms delays (prevents rate limiting)
- Limit to top 50 apex domains from CT logs
- Filters out 0-confidence domains (reduces analysis time)
- Progress indicators for long-running operations

### Expected Performance
| Domains Analyzed | Estimated Time | User Experience |
|-----------------|----------------|-----------------|
| 5 domains | 3-5 seconds | ✅ Fast |
| 10 domains | 6-10 seconds | ✅ Good |
| 20 domains | 12-20 seconds | ⚠️ Medium |
| 50 domains | 30-60 seconds | ⚠️ Slow but shows progress |

---

## 🛡️ Security Features

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

### CORS Protection
Backend proxy endpoints prevent direct API calls to third-party services.

---

## 📁 File Structure

```
strivyr/
├── index.html              # Main application
├── css/
│   ├── styles-modern.css   # Base styles & variables
│   └── survey-modern.css   # Survey-specific styles
├── README.md               # This file
├── RELATIONSHIP_DETECTION_SUMMARY.md  # Detailed technical docs
├── BACKEND_FILTERING_FIX.md          # Backend implementation guide
├── CONFIDENCE_SCORING_FIX.md         # Scoring algorithm details
├── APEX_DOMAIN_FIX.md                # Domain extraction logic
└── WHOIS_LIMITATION.md               # WHOIS service constraints
```

---

## 🚨 Known Limitations

### WHOIS Service
- **Who-Dat API blocks cloud hosting providers** (AWS, Google Cloud, etc.)
- Results in warnings: "WHOIS unavailable - continuing without WHOIS data"
- **Impact**: Confidence scores are 30-40% lower without WHOIS
- **Solutions**: See [WHOIS_LIMITATION.md](WHOIS_LIMITATION.md)

### Rate Limiting
- Sequential processing required to avoid HTTP 429 errors
- 300ms delays between requests
- Analyzing 50 domains takes ~30-60 seconds

### Certificate Transparency
- crt.sh occasionally returns 503 (Service Unavailable)
- Gracefully handles failures with empty results

---

## 🔍 Use Cases

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

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [crt.sh](https://crt.sh/) - Free Certificate Transparency API
- [Who-Dat](https://github.com/Lissy93/who-dat) - Free WHOIS API
- [Chart.js](https://www.chartjs.org/) - Open source charting library

---

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation in the repository

---

**Status**: ✅ Production Ready
**Last Updated**: December 2024
**Version**: 2.0
