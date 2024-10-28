document.addEventListener('DOMContentLoaded', async () => {
    try {
        const mapViewModel = new MapViewModel();
        await mapViewModel.initialize();
        
        // Make it globally accessible if needed for debugging
        window.mapViewModel = mapViewModel;
    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
});