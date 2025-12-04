class OrientationLock {
    constructor() {
        this.createRotationOverlay();
        this.checkOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkOrientation(), 100);
        });
        
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
    }

    createRotationOverlay() {
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.id = 'rotation-overlay';
        this.overlay.innerHTML = `
            <div class="rotation-content">
                <div class="rotation-icon">
                    📱↻
                </div>
                <h2>Please rotate your device</h2>
                <p>This app works best in portrait mode</p>
            </div>
        `;
        
        // Append to body (Styles are now handled by CSS file)
        document.body.appendChild(this.overlay);
    }

    checkOrientation() {
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isMobile && isLandscape) {
            this.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrientationLock();
});