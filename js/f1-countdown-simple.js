console.log('F1 script loaded');

// Simple test
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, F1 script running');
    
    // Test header creation
    const driverList = document.querySelector('.driver-standings .standings-list');
    if (driverList) {
        driverList.innerHTML = `
            <div class="standings-header" style="display: flex !important; background: #242b3a; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; color: #94a3b8; border: 2px solid #3b82f6;">
                <span style="width: 2.5rem; margin-right: 1rem; text-align: center;">Pos</span>
                <span style="flex: 1; min-width: 0;">Driver</span>
                <span style="margin: 0 1rem; flex-shrink: 0;">Team</span>
                <span style="min-width: 4rem; text-align: right;">Points</span>
            </div>
            <div>Test driver data loading...</div>
        `;
    }
});