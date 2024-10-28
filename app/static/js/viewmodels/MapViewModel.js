// static/js/viewmodels/MapViewModel.js
class MapViewModel {
    constructor() {
        this.map = null;
        this.locations = [];
        this.markerClusterGroup = null;
        this.selectedCity = 'all';
        this.selectedCategory = 'all';
        this.selectedDateRange = {
            start: null,
            end: null
        };
        this.activePopover = null;
        this.dateSlider = null;
        this.availableCities = new Set();
        this.availableCategories = new Set();
        this.categoryColors = {
            grains: '#FF6B6B',      // Red
            horticulture: '#4ECDC4', // Turquoise
            fisheries: '#45B7D1',    // Blue
            poultry: '#96CEB4',      // Green
            plantations: '#FFEEAD',  // Yellow
            livestock: '#D4A373'     // Brown
        };
    }

    async initialize() {
        // Initialize map
        this.map = L.map('map', {
            zoomControl: false
        }).setView([-2.5, 118], 5); // Centered on Indonesia

        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize all components
        this.initializeClusterGroup();
        this.initializeDateSlider();
        this.initializeModal();
        await this.loadLocations();
        this.extractFiltersFromData();
        this.renderFilterButtons();
        this.setupFilterInteractions();
    }

    initializeClusterGroup() {
        this.markerClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: (zoom) => {
                if (zoom <= 7) return 80;
                if (zoom <= 10) return 60;
                if (zoom <= 12) return 40;
                return 20;
            },
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true,
            animate: true,
            animateAddingMarkers: true,
            disableClusteringAtZoom: 13,
            spiderfyDistanceMultiplier: 2,
            iconCreateFunction: (cluster) => this.createClusterIcon(cluster)
        });
    }

    initializeDateSlider() {
        const slider = document.getElementById('date-slider');
        if (!slider) return;

        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);

        this.dateSlider = noUiSlider.create(slider, {
            start: [today.getTime(), sixMonthsLater.getTime()],
            connect: true,
            range: {
                'min': today.getTime(),
                'max': sixMonthsLater.getTime()
            },
            step: 24 * 60 * 60 * 1000,
            tooltips: true,
            format: {
                to: function(value) {
                    return new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                },
                from: function(value) {
                    return new Date(value).getTime();
                }
            }
        });

        this.dateSlider.on('update', (values) => {
            const dates = values.map(v => new Date(parseInt(v)));
            document.getElementById('start-date-label').textContent = values[0];
            document.getElementById('end-date-label').textContent = values[1];
            document.getElementById('date-search').value = `${values[0]} - ${values[1]}`;

            this.selectedDateRange = {
                start: dates[0],
                end: dates[1]
            };
            this.updateMap();
        });
    }

    setupFilterInteractions() {
        // Setup popover triggers
        ['location', 'category', 'date'].forEach(section => {
            const element = document.getElementById(`${section}-section`);
            const popover = document.getElementById(`${section}-popover`);
            
            element?.addEventListener('click', () => this.togglePopover(popover, element));
        });

        // Close popovers when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-section') && !e.target.closest('.filter-popover')) {
                this.closeAllPopovers();
            }
        });

        // Filter selection handlers
        this.setupFilterSelectionHandlers();
    }

    setupFilterSelectionHandlers() {
        // City selection
        document.querySelector('#city-filters')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-button')) {
                const city = e.target.dataset.city;
                this.selectedCity = city;
                document.getElementById('city-search').value = 
                    city === 'all' ? '' : e.target.textContent;
                this.updateMap();
                this.closeAllPopovers();
            }
        });

        // Category selection
        document.querySelector('#category-filters')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-button')) {
                const category = e.target.dataset.category;
                this.selectedCategory = category;
                document.getElementById('category-search').value = 
                    category === 'all' ? '' : e.target.textContent;
                this.updateMap();
                this.closeAllPopovers();
            }
        });

        // Search button
        document.querySelector('.search-button')?.addEventListener('click', () => {
            this.updateMap();
            this.closeAllPopovers();
        });
    }

    togglePopover(popover, section) {
        if (this.activePopover === popover) {
            this.closeAllPopovers();
        } else {
            this.closeAllPopovers();
            popover?.classList.add('active');
            section?.classList.add('active');
            this.activePopover = popover;
        }
    }

    closeAllPopovers() {
        document.querySelectorAll('.filter-popover').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.search-section').forEach(s => s.classList.remove('active'));
        this.activePopover = null;
    }

    async loadLocations() {
        try {
            const response = await fetch('/api/locations');
            const data = await response.json();
            // Convert raw data to LocationModel instances
            this.locations = data.locations.map(loc => new LocationModel(loc));
            console.log('Loaded locations:', this.locations); // Debug log
            this.updateMap();
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    }

    extractFiltersFromData() {
        this.availableCities.clear();
        this.availableCategories.clear();

        this.locations.forEach(location => {
            this.availableCities.add(location.city);
            location.products.forEach(product => {
                this.availableCategories.add(product.category);
            });
        });
    }

    renderFilterButtons() {
        // Render city filters
        const cityFiltersContainer = document.querySelector('#city-filters');
        if (cityFiltersContainer) {
            cityFiltersContainer.innerHTML = `
                <button class="filter-button active" data-city="all">All Cities</button>
                ${Array.from(this.availableCities)
                    .sort()
                    .map(city => `
                        <button class="filter-button" data-city="${city}">${city}</button>
                    `).join('')}
            `;
        }

        // Render category filters
        const categoryFiltersContainer = document.querySelector('#category-filters');
        if (categoryFiltersContainer) {
            categoryFiltersContainer.innerHTML = `
                <button class="filter-button active" data-category="all">All Categories</button>
                ${Array.from(this.availableCategories)
                    .sort()
                    .map(category => `
                        <button class="filter-button" data-category="${category}">
                            ${this.formatCategoryName(category)}
                        </button>
                    `).join('')}
            `;
        }
    }

    updateMap() {
        console.log('Updating map with locations:', this.locations);
        
        this.markerClusterGroup.clearLayers();
    
        const filteredLocations = this.locations.filter(location => {
            // City filter
            const cityMatch = this.selectedCity === 'all' || location.city === this.selectedCity;
            
            // Category filter
            const categoryMatch = this.selectedCategory === 'all' || 
                location.products.some(product => product.category === this.selectedCategory);
            
            // Date filter
            let dateMatch = true;
            if (this.selectedDateRange.start && this.selectedDateRange.end) {
                dateMatch = location.products.some(product => {
                    const productStart = new Date(product.sell_period.start);
                    const productEnd = new Date(product.sell_period.end);
                    return (productStart <= this.selectedDateRange.end && 
                            productEnd >= this.selectedDateRange.start);
                });
            }
    
            return cityMatch && categoryMatch && dateMatch;
        });
    
        console.log('Filtered locations:', filteredLocations);
    
        filteredLocations.forEach(location => {
            const marker = this.createCustomMarker(location);
            this.markerClusterGroup.addLayer(marker);
        });
    
        if (!this.map.hasLayer(this.markerClusterGroup)) {
            this.map.addLayer(this.markerClusterGroup);
        }
    
        if (filteredLocations.length > 0) {
            const bounds = L.latLngBounds(filteredLocations.map(loc => [loc.lat, loc.lng]));
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    createClusterIcon(cluster) {
        const markers = cluster.getAllChildMarkers();
        const totalTonnage = markers.reduce((sum, marker) => {
            return sum + marker.options.totalTonnage;
        }, 0);
        
        const childCount = cluster.getChildCount();
        const size = childCount < 5 ? 30 : childCount < 10 ? 40 : 50;

        const categories = [...new Set(markers.flatMap(m => m.options.categories))];
        const color = this.getAverageColor(categories);

        return L.divIcon({
            html: `
                <div class="custom-cluster" style="
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    opacity: 0.9;
                ">
                    <span>${childCount}</span>
                </div>
            `,
            className: 'cluster-icon',
            iconSize: L.point(size, size),
            iconAnchor: L.point(size/2, size/2)
        });
    }

    createCustomMarker(location) {
        // Debug log
        console.log('Creating marker for:', location);
        
        const totalTonnage = location.products.reduce((sum, product) => sum + product.tonnage, 0);
        const categories = [location.products[0].category];
        const size = Math.min(Math.max(20, Math.sqrt(totalTonnage)), 40);
        const color = this.categoryColors[categories[0]];
    
        // Debug log
        console.log('Marker details:', {
            lat: location.lat,
            lng: location.lng,
            size,
            color,
            totalTonnage
        });
    
        const marker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                html: `
                    <div class="custom-marker" style="
                        width: ${size}px;
                        height: ${size}px;
                        background-color: ${color};
                        opacity: 0.9;
                    "></div>
                `,
                className: 'marker-icon',
                iconSize: L.point(size, size),
                iconAnchor: L.point(size/2, size/2)
            }),
            totalTonnage: totalTonnage,
            categories: categories
        });
    
        marker.on('click', () => this.showModal(location));
        marker.bindTooltip(`
            ${location.name}<br>
            ${location.products[0].name}<br>
            ${totalTonnage} tons
        `, {
            offset: L.point(0, -size/2),
            direction: 'top'
        });
    
        return marker;
    }

    showModal(location) {
        const modalBody = document.getElementById('modal-body');
        const categoryColor = this.categoryColors[location.products[0].category];
        
        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${location.name}</h2>
                <div class="subtitle">${location.city}</div>
                <div class="close-modal">&times;</div>
            </div>
            <div class="modal-body">
                <div class="info-section">
                    <div class="info-label">About</div>
                    <div class="info-value">${location.description}</div>
                </div>

                <div class="info-section">
                    <div class="info-label">Contact</div>
                    <div class="info-value">${location.contact}</div>
                </div>

                <div class="info-section">
                    <div class="info-label">Product Details</div>
                    <div class="product-card">
                        <div class="category-badge" style="background: ${categoryColor}15; color: ${categoryColor}">
                            ${this.formatCategoryName(location.products[0].category)}
                        </div>
                        
                        <div class="product-meta">
                            <div class="meta-item">
                                <span class="meta-label">Product</span>
                                <span class="meta-value">${location.products[0].name}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Tonnage</span>
                                <span class="meta-value">${location.products[0].tonnage} tons</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Availability</span>
                                <span class="meta-value">
                                    ${location.products[0].sell_period.start} - ${location.products[0].sell_period.end}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('location-modal').style.display = 'block';

        // Update close button event listener
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('location-modal').style.display = 'none';
        });
    }

    initializeModal() {
        if (!document.getElementById('location-modal')) {
            const modalHtml = `
                <div id="location-modal" class="modal">
                    <div class="modal-content">
                        <div id="modal-body"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            window.addEventListener('click', (e) => {
                const modal = document.getElementById('location-modal');
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    getAverageColor(categories) {
        if (categories.length === 0) return '#808080';
        if (categories.length === 1) return this.categoryColors[categories[0]];

        // Convert colors to RGB and average them
        const colors = categories.map(cat => this.hexToRgb(this.categoryColors[cat]));
        const avg = colors.reduce((acc, curr) => ({
            r: acc.r + curr.r / colors.length,
            g: acc.g + curr.g / colors.length,
            b: acc.b + curr.b / colors.length
        }), {r: 0, g: 0, b: 0});

        return `rgb(${Math.round(avg.r)}, ${Math.round(avg.g)}, ${Math.round(avg.b)})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Helper method to format dates
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Reset all filters to default state
    resetFilters() {
        this.selectedCity = 'all';
        this.selectedCategory = 'all';
        
        // Reset date slider to initial values
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);
        if (this.dateSlider) {
            this.dateSlider.set([today.getTime(), sixMonthsLater.getTime()]);
        }

        // Reset UI elements
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.city === 'all' || btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });

        // Reset input fields
        document.getElementById('city-search').value = '';
        document.getElementById('category-search').value = '';
        document.getElementById('date-search').value = '';

        // Update map with reset filters
        this.updateMap();
        this.closeAllPopovers();
    }

    // Error handling method
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        // You can implement user-facing error messaging here
    }

    // Cleanup method for when the component is destroyed
    destroy() {
        // Remove event listeners
        document.removeEventListener('click', this.closeAllPopovers);
        
        // Destroy map instance
        if (this.map) {
            this.map.remove();
        }

        // Destroy date slider
        if (this.dateSlider) {
            this.dateSlider.destroy();
        }

        // Clear any remaining timeouts or intervals if they exist
    }
}

