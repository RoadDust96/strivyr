# Backend Proxy Endpoints - Implementation Guide

## Overview

Your frontend at `survey.strivyr.com` needs two new backend proxy endpoints to fetch WHOIS and Certificate Transparency data without CORS issues.

---

## Required Endpoints

### 1. `/api/whois` - WHOIS Data Proxy
### 2. `/api/ct-logs` - Certificate Transparency Logs Proxy

---

## Implementation Code

### Endpoint 1: POST /api/whois

**Purpose**: Fetch WHOIS registration data via Who-Dat API

**Request Format**:
```json
{
  "domain": "google.com"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "registrant": {
      "name": "Google LLC",
      "organization": "Google LLC",
      "email": "registrar@google.com"
    },
    "registrar": "MarkMonitor Inc.",
    "nameservers": ["ns1.google.com", "ns2.google.com"],
    "created": "1997-09-15",
    "emails": ["registrar@google.com"],
    "organization": "Google LLC"
  }
}
```

**Implementation** (Node.js/Express):

```javascript
app.post('/api/whois', async (req, res) => {
  const { domain } = req.body;

  // Validation
  if (!domain) {
    return res.status(400).json({
      success: false,
      error: 'Domain is required'
    });
  }

  // Sanitize domain input
  const sanitizedDomain = domain.trim().toLowerCase();

  // Basic domain format validation
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(sanitizedDomain)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid domain format'
    });
  }

  try {
    // Fetch from Who-Dat API
    const response = await fetch(`https://who-dat.as93.net/${sanitizedDomain}`, {
      headers: {
        'User-Agent': 'StrivyrSurvey/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle rate limiting (429) gracefully
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
          data: {
            registrant: {},
            registrar: '',
            nameservers: [],
            created: '',
            emails: [],
            organization: ''
          }
        });
      }

      throw new Error(`Who-Dat API error: ${response.status}`);
    }

    const whoisData = await response.json();

    // Normalize the response structure
    res.json({
      success: true,
      data: {
        registrant: whoisData.registrant || {},
        registrar: whoisData.registrar || '',
        nameservers: whoisData.nameServers || whoisData.nameservers || [],
        created: whoisData.createdDate || whoisData.created || '',
        emails: whoisData.emails || [],
        organization: whoisData.registrant?.organization || whoisData.organization || ''
      }
    });

  } catch (error) {
    console.error('WHOIS fetch error:', error);

    // Return graceful fallback instead of error
    res.json({
      success: false,
      error: error.message,
      data: {
        registrant: {},
        registrar: '',
        nameservers: [],
        created: '',
        emails: [],
        organization: ''
      }
    });
  }
});
```

---

### Endpoint 2: POST /api/ct-logs

**Purpose**: Fetch Certificate Transparency logs from crt.sh

**Request Format**:
```json
{
  "domain": "google.com"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "issuer_name": "C=US, O=Google Trust Services LLC, CN=GTS CA 1P5",
        "common_name": "*.google.com",
        "name_value": "*.google.com\nwww.google.com\ngoogle.com",
        "id": 12345678,
        "entry_timestamp": "2025-01-15T12:00:00.000"
      }
    ],
    "relatedDomains": ["youtube.com", "gmail.com", "google.co.uk"]
  }
}
```

**Implementation** (Node.js/Express):

```javascript
app.post('/api/ct-logs', async (req, res) => {
  const { domain } = req.body;

  // Validation
  if (!domain) {
    return res.status(400).json({
      success: false,
      error: 'Domain is required'
    });
  }

  // Sanitize domain input
  const sanitizedDomain = domain.trim().toLowerCase();

  // Basic domain format validation
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(sanitizedDomain)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid domain format'
    });
  }

  try {
    // Fetch from crt.sh (Certificate Transparency logs)
    const response = await fetch(
      `https://crt.sh/?q=%.${sanitizedDomain}&output=json`,
      {
        headers: {
          'User-Agent': 'StrivyrSurvey/1.0',
          'Accept': 'application/json'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      // Handle service unavailability (503) gracefully
      if (response.status === 503) {
        return res.json({
          success: false,
          error: 'Certificate Transparency service temporarily unavailable',
          data: {
            certificates: [],
            relatedDomains: []
          }
        });
      }

      throw new Error(`crt.sh API error: ${response.status}`);
    }

    const certificates = await response.json();

    // Extract unique related domains from certificates
    const relatedDomains = new Set();
    const baseDomain = sanitizedDomain;
    const baseKeyword = baseDomain.split('.')[0]; // e.g., "google" from "google.com"

    // Process certificates to find related domains
    certificates.forEach(cert => {
      // Extract from common_name
      if (cert.common_name) {
        const cleanDomain = cert.common_name
          .replace('*.', '')
          .toLowerCase()
          .trim();

        // Only include if it's different from base domain
        if (cleanDomain !== baseDomain &&
            cleanDomain.includes(baseKeyword) &&
            cleanDomain.includes('.')) {
          relatedDomains.add(cleanDomain);
        }
      }

      // Extract from Subject Alternative Names (SANs)
      if (cert.name_value) {
        cert.name_value.split('\n').forEach(san => {
          const cleanDomain = san
            .replace('*.', '')
            .toLowerCase()
            .trim();

          // Only include if it's different from base domain
          if (cleanDomain !== baseDomain &&
              cleanDomain.includes(baseKeyword) &&
              cleanDomain.includes('.')) {
            relatedDomains.add(cleanDomain);
          }
        });
      }
    });

    // Limit to top 10 related domains to avoid overwhelming the frontend
    const relatedDomainsArray = Array.from(relatedDomains).slice(0, 10);

    res.json({
      success: true,
      data: {
        certificates: certificates,
        relatedDomains: relatedDomainsArray
      }
    });

  } catch (error) {
    console.error('CT log fetch error:', error);

    // Return graceful fallback
    res.json({
      success: false,
      error: error.message,
      data: {
        certificates: [],
        relatedDomains: []
      }
    });
  }
});
```

---

## Security Considerations

### 1. Rate Limiting
Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

// Apply to both endpoints
app.use('/api/whois', apiLimiter);
app.use('/api/ct-logs', apiLimiter);
```

### 2. Input Validation
- ✅ Already included in implementation above
- Sanitize domain input (trim, lowercase)
- Validate domain format with regex
- Reject invalid domains early

### 3. CORS Configuration
Allow requests from your frontend:

```javascript
const cors = require('cors');

app.use('/api/whois', cors({
  origin: 'https://survey.strivyr.com',
  methods: ['POST'],
  credentials: true
}));

app.use('/api/ct-logs', cors({
  origin: 'https://survey.strivyr.com',
  methods: ['POST'],
  credentials: true
}));
```

### 4. Error Handling
- ✅ Already included with try/catch blocks
- Return graceful fallbacks instead of 500 errors
- Log errors server-side for debugging
- Don't expose internal error details to frontend

---

## Testing the Endpoints

### Test with cURL:

**WHOIS Endpoint**:
```bash
curl -X POST https://survey.strivyr.com/api/whois \
  -H "Content-Type: application/json" \
  -d '{"domain":"google.com"}'
```

**CT Logs Endpoint**:
```bash
curl -X POST https://survey.strivyr.com/api/ct-logs \
  -H "Content-Type: application/json" \
  -d '{"domain":"google.com"}'
```

### Test with Postman/Insomnia:

**Request**:
- Method: POST
- URL: `https://survey.strivyr.com/api/whois`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "domain": "google.com"
}
```

---

## Deployment Checklist

- [ ] Add both endpoints to your backend repository
- [ ] Install required dependencies (`express`, `node-fetch` or native `fetch`)
- [ ] Configure CORS to allow requests from `survey.strivyr.com`
- [ ] Add rate limiting to prevent abuse
- [ ] Test endpoints with cURL or Postman
- [ ] Deploy to production
- [ ] Verify frontend can now fetch related domains without CORS errors

---

## Expected Behavior After Implementation

Once these endpoints are live:

1. **User searches for a domain** (e.g., "google.com")
2. **Frontend fetches DNS records** (existing functionality)
3. **Frontend calls `/api/whois`** → Backend fetches from Who-Dat → Returns WHOIS data
4. **Frontend calls `/api/ct-logs`** → Backend fetches from crt.sh → Returns related domains
5. **Frontend calculates confidence scores** for each related domain
6. **Results display**:
   - Mini chart in summary section
   - Top 3 related domains preview
   - Quick stats (total records, related count, high confidence)
   - Full related domains list in "All Related Domains" tab

---

## Troubleshooting

### Issue: "Rate limit exceeded" (429)
**Solution**: Implement caching to reduce API calls:
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Check cache before fetching
const cachedData = cache.get(sanitizedDomain);
if (cachedData) {
  return res.json({ success: true, data: cachedData });
}

// After fetching, cache the result
cache.set(sanitizedDomain, data);
```

### Issue: "Service unavailable" (503)
**Solution**: Already handled in code with graceful fallback. crt.sh occasionally has downtime.

### Issue: CORS still blocking
**Solution**: Verify CORS middleware is configured correctly and deployed.

---

## API Documentation References

- **Who-Dat API**: https://github.com/Lissy93/who-dat
- **crt.sh**: https://crt.sh/
- **Certificate Transparency**: https://certificate.transparency.dev/

---

**Status**: Frontend is ready and waiting for these endpoints ✅
**Next Step**: Implement both endpoints in your backend repository
**Priority**: High - Related domains feature is non-functional until these are deployed
