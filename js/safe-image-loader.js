// Safe Image Loading Handler
// Replaces inline onerror handlers with CSP-compliant event listeners

document.addEventListener('DOMContentLoaded', function() {
    // Handle preview images with fallback placeholders
    const previewImages = document.querySelectorAll('.preview-image');
    
    previewImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = this.nextElementSibling;
            if (placeholder && placeholder.classList.contains('preview-placeholder')) {
                placeholder.classList.remove('hidden');
            }
        });
    });
});