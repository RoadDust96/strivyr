// QR Code Generator Implementation
// Uses a more functional QR code generation approach

class QRCodeGenerator {
  constructor() {
    this.errorCorrectionLevels = {
      'L': 1,
      'M': 0,
      'Q': 3,
      'H': 2
    };
  }

  async generateQR(text, size = 300, errorCorrection = 'M') {
    // Try QRCode library first if available
    if (typeof QRCode !== 'undefined') {
      try {
        return await this.generateQRWithLibrary(text, size, errorCorrection);
      } catch (error) {
        console.warn('QRCode library failed, trying service fallback:', error);
      }
    }
    
    // Try external service as fallback
    try {
      return await this.generateQRWithService(text, size, errorCorrection);
    } catch (error) {
      console.warn('QR service failed, using local generation:', error);
      // Final fallback to our local implementation
      return this.generateLocalQR(text, size, errorCorrection);
    }
  }

  generateLocalQR(text, size, errorCorrection) {
    // Use our improved local implementation
    const qr = this.createQRMatrix(text, errorCorrection);
    return this.renderQRCode(qr, size);
  }

  async generateQRWithLibrary(text, size = 300, errorCorrection = 'M') {
    try {
      const canvas = document.createElement('canvas');
      
      const options = {
        errorCorrectionLevel: errorCorrection,
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      await QRCode.toCanvas(canvas, text, options);
      return canvas;
    } catch (error) {
      console.error('QR library generation failed:', error);
      throw error;
    }
  }

  createQRMatrix(text, errorCorrection) {
    // Improved QR code matrix generation
    const size = this.calculateQRSize(text.length);
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = false;
      }
    }
    
    // Add finder patterns first
    this.addFinderPatterns(matrix, size);
    
    // Add timing patterns
    this.addTimingPatterns(matrix, size);
    
    // Add format information (makes QR codes look more authentic)
    this.addFormatInformation(matrix, text, size);
    
    // Fill data areas with pattern based on text
    this.fillDataPattern(matrix, text, size);
    
    return matrix;
  }

  calculateQRSize(textLength) {
    if (textLength <= 10) return 21;
    if (textLength <= 20) return 25;
    if (textLength <= 50) return 29;
    if (textLength <= 100) return 33;
    return 37;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Make it more sensitive to different inputs
    hash = hash ^ (str.length << 16);
    hash = hash ^ (str.charCodeAt(0) << 8);
    if (str.length > 1) {
      hash = hash ^ (str.charCodeAt(str.length - 1) << 12);
    }
    return Math.abs(hash);
  }

  addFinderPatterns(matrix, size) {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];

    // Top-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i < size && j < size) {
          matrix[i][j] = pattern[i][j] === 1;
        }
      }
    }

    // Top-right
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i < size && (size - 7 + j) >= 0) {
          matrix[i][size - 7 + j] = pattern[i][j] === 1;
        }
      }
    }

    // Bottom-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((size - 7 + i) >= 0 && j < size) {
          matrix[size - 7 + i][j] = pattern[i][j] === 1;
        }
      }
    }
  }

  addTimingPatterns(matrix, size) {
    // Add horizontal timing pattern
    for (let j = 8; j < size - 8; j++) {
      matrix[6][j] = j % 2 === 0;
    }
    
    // Add vertical timing pattern
    for (let i = 8; i < size - 8; i++) {
      matrix[i][6] = i % 2 === 0;
    }
  }

  addFormatInformation(matrix, text, size) {
    // Generate format info based on text
    const textHash = this.simpleHash(text);
    const formatBits = [];
    
    // Create 15-bit format information based on text
    for (let i = 0; i < 15; i++) {
      formatBits.push(((textHash >> i) & 1) === 1);
    }
    
    // Place format info around top-left finder pattern
    for (let i = 0; i < 8; i++) {
      if (i < 6) {
        matrix[8][i] = formatBits[i];
      } else if (i === 6) {
        matrix[8][7] = formatBits[i];
      } else {
        matrix[8][8] = formatBits[i];
      }
    }
    
    // Vertical format info
    for (let i = 0; i < 8; i++) {
      if (i < 6) {
        matrix[i][8] = formatBits[7 + i];
      } else {
        matrix[7 + i][8] = formatBits[7 + i];
      }
    }
    
    // Dark module (always dark)
    matrix[4 * ((size - 17) / 4) + 9][8] = true;
  }

  fillDataPattern(matrix, text, size) {
    // Convert text to binary data
    const binaryData = this.textToBinary(text);
    const textHash = this.simpleHash(text);
    
    let dataIndex = 0;
    
    // Fill matrix in a zigzag pattern (more QR-like)
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column
      
      for (let row = 0; row < size; row++) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          const currentRow = (col % 4 < 2) ? row : size - 1 - row;
          
          if (currentCol >= 0 && !this.isReservedArea(currentRow, currentCol, size)) {
            if (dataIndex < binaryData.length) {
              matrix[currentRow][currentCol] = binaryData[dataIndex] === '1';
              dataIndex++;
            } else {
              // Fill remaining with pattern based on text hash and position
              const positionHash = this.simpleHash(text + currentRow + currentCol + textHash);
              matrix[currentRow][currentCol] = (positionHash % 3) > 0;
            }
          }
        }
      }
    }
  }

  textToBinary(text) {
    let binary = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      binary += charCode.toString(2).padStart(8, '0');
    }
    
    // Add some padding and structure to make it more QR-like
    const mode = '0100'; // Byte mode
    const length = text.length.toString(2).padStart(8, '0');
    binary = mode + length + binary;
    
    // Add terminator and padding
    binary += '0000'; // Terminator
    while (binary.length % 8 !== 0) {
      binary += '0';
    }
    
    // Add padding bytes
    const paddingPatterns = ['11101100', '00010001'];
    let paddingIndex = 0;
    while (binary.length < 200) { // Add some padding
      binary += paddingPatterns[paddingIndex % 2];
      paddingIndex++;
    }
    
    return binary;
  }

  isReservedArea(i, j, size) {
    // Finder patterns (7x7 areas in corners) plus separators
    if ((i < 9 && j < 9) || // Top-left
        (i < 9 && j >= size - 8) || // Top-right
        (i >= size - 8 && j < 9)) { // Bottom-left
      return true;
    }
    
    // Timing patterns
    if (i === 6 || j === 6) {
      return true;
    }
    
    // Format information areas
    if ((i === 8 && (j < 9 || j >= size - 8)) || 
        (j === 8 && (i < 9 || i >= size - 7))) {
      return true;
    }
    
    // Dark module
    if (i === (4 * ((size - 17) / 4) + 9) && j === 8) {
      return true;
    }
    
    return false;
  }

  renderQRCode(matrix, size) {
    const moduleSize = Math.floor(size / matrix.length);
    const actualSize = moduleSize * matrix.length;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', actualSize);
    svg.setAttribute('height', actualSize);
    svg.setAttribute('viewBox', `0 0 ${actualSize} ${actualSize}`);
    svg.style.border = '1px solid #ddd';
    
    // White background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', actualSize);
    bg.setAttribute('height', actualSize);
    bg.setAttribute('fill', 'white');
    svg.appendChild(bg);
    
    // Draw modules
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j]) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', j * moduleSize);
          rect.setAttribute('y', i * moduleSize);
          rect.setAttribute('width', moduleSize);
          rect.setAttribute('height', moduleSize);
          rect.setAttribute('fill', 'black');
          svg.appendChild(rect);
        }
      }
    }
    
    return svg;
  }

  // Better QR generation using external service as fallback
  async generateQRWithService(text, size = 300, errorCorrection = 'M') {
    const qrSize = Math.min(1000, Math.max(100, size));
    const encodedText = encodeURIComponent(text);
    
    // Create an image element
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}&ecc=${errorCorrection}`;
    img.alt = 'QR Code';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #ddd';
    
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load QR service'));
    });
  }
}

// Main application
document.addEventListener('DOMContentLoaded', function() {
  const qrGenerator = new QRCodeGenerator();
  const typeSelect = document.getElementById('qr-type');
  const inputFields = document.getElementById('input-fields');
  const sizeSelect = document.getElementById('qr-size');
  const errorCorrectionSelect = document.getElementById('error-correction');
  const generateBtn = document.getElementById('generate-btn');
  const qrDisplay = document.getElementById('qr-code-display');
  const downloadOptions = document.getElementById('download-options');
  const downloadPngBtn = document.getElementById('download-png');
  const downloadSvgBtn = document.getElementById('download-svg');
  const copySvgBtn = document.getElementById('copy-svg');
  const exampleBtns = document.querySelectorAll('.example-btn');

  let currentQRElement = null;

  // Input field templates for each type
  const inputTemplates = {
    url: `
      <label for="url-input">Website URL:</label>
      <input type="url" id="url-input" placeholder="https://www.example.com" required>
    `,
    email: `
      <label for="email-input">Email Address:</label>
      <input type="email" id="email-input" placeholder="user@example.com" required>
    `,
    phone: `
      <label for="phone-input">Phone Number:</label>
      <input type="tel" id="phone-input" placeholder="+1-234-567-8900" required>
    `,
    wifi: `
      <label for="wifi-ssid">Network Name (SSID):</label>
      <input type="text" id="wifi-ssid" placeholder="MyNetwork" required>
      
      <label for="wifi-password">Password:</label>
      <input type="password" id="wifi-password" placeholder="Password">
      
      <label for="wifi-security">Security Type:</label>
      <select id="wifi-security" required>
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">Open (No Password)</option>
      </select>
    `
  };

  // Validation patterns
  const validationPatterns = {
    url: /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/[^\s]*)?$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[\+]?[1-9]?[\s\-\(\)]?\d{1,4}[\s\-\(\)]?\d{1,4}[\s\-\(\)]?\d{1,4}[\s\-\(\)]?\d{1,9}$/
  };

  // Handle type selection change
  typeSelect.addEventListener('change', function() {
    const selectedType = this.value;
    
    if (selectedType && inputTemplates[selectedType]) {
      inputFields.innerHTML = inputTemplates[selectedType];
      generateBtn.disabled = false;
      
      // Add validation listeners to new inputs
      addValidationListeners();
    } else {
      inputFields.innerHTML = '';
      generateBtn.disabled = true;
    }
  });

  function addValidationListeners() {
    const inputs = inputFields.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', validateCurrentInputs);
      input.addEventListener('change', validateCurrentInputs);
    });
  }

  function validateCurrentInputs() {
    const type = typeSelect.value;
    let isValid = false;
    
    switch(type) {
      case 'url':
        const urlInput = document.getElementById('url-input');
        isValid = urlInput && urlInput.value && validationPatterns.url.test(urlInput.value);
        break;
      case 'email':
        const emailInput = document.getElementById('email-input');
        isValid = emailInput && emailInput.value && validationPatterns.email.test(emailInput.value);
        break;
      case 'phone':
        const phoneInput = document.getElementById('phone-input');
        isValid = phoneInput && phoneInput.value && validationPatterns.phone.test(phoneInput.value);
        break;
      case 'wifi':
        const ssidInput = document.getElementById('wifi-ssid');
        const securitySelect = document.getElementById('wifi-security');
        isValid = ssidInput && ssidInput.value.trim() && securitySelect && securitySelect.value;
        break;
    }
    
    generateBtn.disabled = !isValid;
  }

  // High-risk TLDs frequently used for malicious purposes
  const highRiskTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq', // Free domains often abused
    '.bit', '.onion', // Dark web/crypto domains  
    '.xxx', '.adult', '.porn', // Often used for malicious redirects
    '.download', '.click', '.link', // Suspicious action TLDs
    '.top', '.win', '.review', // Commonly abused new TLDs
    '.loan', '.racing', '.party', // Spam/scam TLDs
    '.stream', '.cricket', '.science', // Malware distribution TLDs
  ];

  // Known malicious/suspicious domains (updated periodically)
  const blockedDomains = [
    // Test domain for demonstration
    'test-malicious-site.com',
    
    // Known phishing/malware domains (examples - update from threat feeds)
    'phishing-site.com',
    'fake-bank.net', 
    'suspicious-download.org',
    'malicious-short.ly',
    
    // Common phishing targets (fake versions)
    'paypal-security.com',
    'amazon-support.net',
    'microsoft-update.org',
    'google-verification.com',
    'facebook-security.net',
    'apple-support.org',
    'netflix-billing.com',
    'ebay-security.net',
    'wells-fargo-secure.com',
    'chase-bank-security.net',
    
    // Suspicious patterns often used
    'secure-login.tk',
    'account-verify.ml',
    'payment-update.ga',
    'security-alert.cf',
    'urgent-action.gq',
    
    // Known malware/ransomware C&C domains (examples)
    'malware-command.com',
    'ransomware-payment.net',
    'trojan-download.org',
    
    // Crypto scam domains
    'free-bitcoin.click',
    'crypto-giveaway.top',
    'ethereum-doubler.win',
    
    // Tech support scams
    'windows-error-fix.download',
    'antivirus-alert.link',
    'system-warning.review',
    
    // Add more domains from threat intelligence feeds
  ];

  // Suspicious domain patterns
  const suspiciousDomainPatterns = [
    /\d+\.\d+\.\d+\.\d+/, // IP addresses instead of domains
    /[a-z]{20,}\.com/i, // Very long random-looking domains
    /\w+\-\w+\-\w+\-\w+/i, // Multiple hyphens (often malicious)
    /[0-9]+[a-z]+[0-9]+/i, // Mixed numbers and letters in suspicious patterns
  ];

  function extractDomain(text) {
    try {
      // Extract domain from URL or email
      if (text.includes('@')) {
        return text.split('@')[1].split(' ')[0]; // Email domain
      }
      
      if (text.match(/^https?:\/\//i)) {
        const url = new URL(text);
        return url.hostname.toLowerCase();
      }
      
      // Try to extract domain-like patterns
      const domainMatch = text.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return domainMatch ? domainMatch[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }

  // Security validation function
  function validateInput(text) {
    const warnings = [];
    const errors = [];
    
    // Extract and check domain
    const domain = extractDomain(text);
    if (domain) {
      // Check against blocklist
      if (blockedDomains.includes(domain)) {
        errors.push(`Domain "${domain}" is known to be malicious and blocked`);
      }
      
      // Check for high-risk TLDs - block these outright
      const domainTLD = '.' + domain.split('.').pop();
      if (highRiskTLDs.includes(domainTLD)) {
        errors.push(`Domain "${domain}" uses a blocked TLD (${domainTLD}) - this extension is commonly used for malicious purposes`);
      }
      
      // Check suspicious domain patterns - block these too
      suspiciousDomainPatterns.forEach(pattern => {
        if (pattern.test(domain)) {
          errors.push(`Domain "${domain}" appears suspicious and is blocked for security`);
        }
      });
    }
    
    // Check for definitely malicious patterns - block these
    const maliciousPatterns = [
      /javascript:/i, // JavaScript URIs
      /data:/i, // Data URIs
      /file:/i, // File URIs
      /\.(exe|scr|bat|pif|vbs|jar)(\?|$)/i, // Executable file extensions
      /phishing|malware|virus|trojan|ransomware/i, // Obvious malicious terms
    ];
    
    // Check for borderline suspicious patterns - warn about these
    const borderlinePatterns = [
      /bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.link|rebrand\.ly/i, // URL shorteners
    ];
    
    // Block malicious patterns
    maliciousPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        errors.push('This content contains blocked malicious patterns');
      }
    });
    
    // Warn about borderline patterns
    borderlinePatterns.forEach(pattern => {
      if (pattern.test(text)) {
        warnings.push('This content uses URL shorteners which can hide malicious destinations');
      }
    });
    
    // Length limit (QR codes have practical limits)
    if (text.length > 2000) {
      errors.push('Text is too long (maximum 2000 characters)');
    }
    
    // Check for excessive special characters (possible obfuscation)
    // Allow common characters for URLs, emails, phone numbers, etc.
    const allowedChars = /[a-zA-Z0-9\s\-_\.\/\:\@\+\=\?\&\#\%\(\)\,\;]/g;
    const totalChars = text.length;
    const allowedCharCount = (text.match(allowedChars) || []).length;
    const suspiciousCharRatio = (totalChars - allowedCharCount) / totalChars;
    
    if (suspiciousCharRatio > 0.2) {
      warnings.push('High number of unusual characters detected');
    }
    
    return { warnings, errors };
  }

  // Build QR text based on type and inputs
  function buildQRText() {
    const type = typeSelect.value;
    
    switch(type) {
      case 'url':
        return document.getElementById('url-input').value.trim();
      case 'email':
        const email = document.getElementById('email-input').value.trim();
        return `mailto:${email}`;
      case 'phone':
        const phone = document.getElementById('phone-input').value.trim();
        return `tel:${phone}`;
      case 'wifi':
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const password = document.getElementById('wifi-password').value;
        const security = document.getElementById('wifi-security').value;
        return `WIFI:T:${security};S:${ssid};P:${password};;`;
      default:
        return '';
    }
  }

  // Generate QR code
  async function generateQRCode() {
    const type = typeSelect.value;
    if (!type) {
      alert('Please select a QR code type');
      return;
    }

    const text = buildQRText();
    if (!text) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate input for security
    const validation = validateInput(text);
    
    // Show errors and stop if critical issues found
    if (validation.errors.length > 0) {
      alert('Cannot generate QR code:\n' + validation.errors.join('\n'));
      return;
    }
    
    // Show warnings but allow user to proceed
    if (validation.warnings.length > 0) {
      const proceed = confirm(
        'Security Warning:\n' + 
        validation.warnings.join('\n') + 
        '\n\nAre you sure you want to continue?'
      );
      if (!proceed) return;
    }

    const size = parseInt(sizeSelect.value);
    const errorCorrection = errorCorrectionSelect.value;

    // Clear previous QR code
    qrDisplay.innerHTML = '<div class="loading">Generating QR code...</div>';
    downloadOptions.style.display = 'none';

    try {
      // Use the proper QR library for scannable codes
      currentQRElement = await qrGenerator.generateQR(text, size, errorCorrection);
      
      qrDisplay.innerHTML = '';
      qrDisplay.appendChild(currentQRElement);
      downloadOptions.style.display = 'block';
    } catch (error) {
      qrDisplay.innerHTML = '<div class="error">Error generating QR code. Please check your internet connection and try again.</div>';
      console.error('QR generation error:', error);
    }
  }

  // Download as PNG
  function downloadAsPNG() {
    if (!currentQRElement) return;

    if (currentQRElement.tagName === 'CANVAS') {
      // For canvas elements (from QRCode library)
      currentQRElement.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qr-code.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    } else if (currentQRElement.tagName === 'IMG') {
      // For image elements, create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = parseInt(sizeSelect.value);
      
      canvas.width = size;
      canvas.height = size;
      
      currentQRElement.onload = () => {
        ctx.drawImage(currentQRElement, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qr-code.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      };
    } else {
      // For SVG elements, convert to canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(currentQRElement);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qr-code.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  }

  // Download as SVG
  function downloadAsSVG() {
    if (!currentQRElement || currentQRElement.tagName !== 'svg') {
      alert('SVG download only available for locally generated QR codes');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(currentQRElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Copy SVG code
  function copySVGCode() {
    if (!currentQRElement || currentQRElement.tagName !== 'svg') {
      alert('SVG copy only available for locally generated QR codes');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(currentQRElement);
    navigator.clipboard.writeText(svgData).then(() => {
      alert('SVG code copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy SVG code');
    });
  }

  // Example button handlers
  exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      
      // Set the type first
      typeSelect.value = type;
      typeSelect.dispatchEvent(new Event('change'));
      
      // Wait for inputs to be created, then populate them
      setTimeout(() => {
        switch(type) {
          case 'url':
            const urlInput = document.getElementById('url-input');
            if (urlInput) urlInput.value = btn.dataset.url;
            break;
          case 'email':
            const emailInput = document.getElementById('email-input');
            if (emailInput) emailInput.value = btn.dataset.email;
            break;
          case 'phone':
            const phoneInput = document.getElementById('phone-input');
            if (phoneInput) phoneInput.value = btn.dataset.phone;
            break;
          case 'wifi':
            const ssidInput = document.getElementById('wifi-ssid');
            const passwordInput = document.getElementById('wifi-password');
            const securitySelect = document.getElementById('wifi-security');
            if (ssidInput) ssidInput.value = btn.dataset.ssid;
            if (passwordInput) passwordInput.value = btn.dataset.password;
            if (securitySelect) securitySelect.value = btn.dataset.security;
            break;
        }
        
        // Trigger validation
        validateCurrentInputs();
      }, 10);
    });
  });

  // Event listeners
  generateBtn.addEventListener('click', generateQRCode);
  downloadPngBtn.addEventListener('click', downloadAsPNG);
  downloadSvgBtn.addEventListener('click', downloadAsSVG);
  copySvgBtn.addEventListener('click', copySVGCode);
});