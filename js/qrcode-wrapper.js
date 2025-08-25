// QR Code Wrapper for Canvas API compatibility
// Wraps the qrcode-generator library to match expected window.QRCode interface

window.QRCode = {
  toCanvas: function(canvas, text, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const errorCorrectionLevel = options.errorCorrectionLevel || 'M';
        const margin = options.margin || 4;
        
        // Calculate scale based on desired size (default 300px)
        const desiredSize = options.width || options.size || 300;
        
        // Create QR code using the qrcode library
        const qr = window.qrcode(-1, errorCorrectionLevel); // -1 means auto-detect size
        qr.addData(text);
        qr.make();
        
        const moduleCount = qr.getModuleCount();
        // Calculate scale to fit desired size, minimum 2px per module for visibility
        const availableSize = desiredSize - (margin * 2);
        const scale = Math.max(2, Math.floor(availableSize / moduleCount));
        const cellSize = scale;
        const actualSize = moduleCount * cellSize + margin * 2;
        
        console.log(`QR Size Debug: desired=${desiredSize}, modules=${moduleCount}, scale=${scale}, actual=${actualSize}`);
        
        // Set canvas size
        canvas.width = actualSize;
        canvas.height = actualSize;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas with white background
        ctx.fillStyle = options.color?.light || '#FFFFFF';
        ctx.fillRect(0, 0, actualSize, actualSize);
        
        // Draw QR modules
        ctx.fillStyle = options.color?.dark || '#000000';
        
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                margin + col * cellSize,
                margin + row * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }
        
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  toDataURL: function(text, options = {}) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      this.toCanvas(canvas, text, options)
        .then(() => resolve(canvas.toDataURL()))
        .catch(reject);
    });
  }
};