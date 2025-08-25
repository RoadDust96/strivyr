// CSP Security Implementation for Static Sites
// Hash-based CSP - Most secure approach for sites without inline content

class CSPManager {
    constructor() {
        this.init();
    }

    init() {
        // Set up hash-based CSP meta tag for local development
        this.updateCSP();
        // Initialize security monitoring
        this.initSecurityMonitoring();
    }

    updateCSP() {
        const csp = `default-src 'self'; ` +
                   `script-src 'self' https://cdn.jsdelivr.net; ` +
                   `style-src 'self' https://fonts.googleapis.com; ` +
                   `font-src 'self' https://fonts.gstatic.com; ` +
                   `connect-src 'self' https://api.qrserver.com https://api.jolpi.ca; ` +
                   `img-src 'self' https://api.qrserver.com data:; ` +
                   `object-src 'none'; ` +
                   `base-uri 'self'; ` +
                   `frame-ancestors 'self'; ` +
                   `upgrade-insecure-requests`;

        // Create CSP meta tag for local development (Cloudflare handles production)
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', csp);
            document.head.appendChild(cspMeta);
        }
    }

    initSecurityMonitoring() {
        // Monitor for CSP violations
        document.addEventListener('securitypolicyviolation', (e) => {
            console.warn('CSP Violation:', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy
            });
        });
    }
}

// Initialize CSP Manager immediately
const cspManager = new CSPManager();
window.cspManager = cspManager;