// Dashboard JavaScript - Location filtering, upload workflow, and interactions

let currentStep = 1;
let uploadedFiles = [];
let adData = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeFilters();
    initializeUpload();
    initializeAvailabilityGrid();
    checkAuthentication();
});

function checkAuthentication() {
    const customerData = getCustomerData();
    if (!customerData) {
        window.location.href = 'index.html';
        return;
    }
}

function loadUserData() {
    const customerData = getCustomerData();
    if (customerData) {
        document.getElementById('userName').textContent = customerData.contactName || customerData.businessName || 'Usuario';
    }
}

// User Menu Management
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Placeholder functions for user menu items
function showProfile() {
    showNotification('Funcionalidad de perfil próximamente disponible', 'info');
    toggleUserMenu();
}

function showMyAds() {
    window.location.href = 'my-ads.html';
    toggleUserMenu();
}

function showBilling() {
    showNotification('Sección de facturación próximamente disponible', 'info');
    toggleUserMenu();
}

// Location Filtering
function initializeFilters() {
    // No additional initialization needed for now
}

function filterLocations() {
    const locationFilter = document.getElementById('locationFilter').value;
    const cards = document.querySelectorAll('.location-card');
    
    cards.forEach(card => {
        const cardLocation = card.getAttribute('data-location');
        const shouldShow = !locationFilter || cardLocation === locationFilter;
        
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function filterByPrice() {
    const priceFilter = document.getElementById('priceFilter').value;
    const cards = document.querySelectorAll('.location-card');
    
    cards.forEach(card => {
        const cardPrice = parseInt(card.getAttribute('data-price'));
        const shouldShow = !priceFilter || cardPrice <= parseInt(priceFilter);
        
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function filterByTime() {
    // For now, just show notification
    const timeFilter = document.getElementById('timeFilter').value;
    if (timeFilter) {
        showNotification(`Filtro por horario "${timeFilter}" aplicado`, 'info');
    }
}

// Calendar/Booking functionality
function showCalendar(locationId) {
    // Store the selected location for the booking page
    localStorage.setItem('selectedLocation', locationId);
    window.location.href = 'booking.html';
}

// Upload Modal Management
function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetUploadFlow();
}

function hideUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetUploadFlow();
}

function resetUploadFlow() {
    currentStep = 1;
    uploadedFiles = [];
    adData = {};
    updateStepDisplay();
    clearFilePreview();
    resetForms();
    // Ensure the modal scrolls to top
    const modal = document.querySelector('.upload-modal');
    if (modal) {
        modal.scrollTop = 0;
    }
}

// Upload Step Management
function nextStep() {
    if (currentStep === 1) {
        if (uploadedFiles.length === 0) {
            showNotification('Por favor subí al menos un archivo', 'error');
            return;
        }
    } else if (currentStep === 2) {
        if (!validateAdDetails()) {
            return;
        }
        populateReview();
    } else if (currentStep === 3) {
        submitAd();
        return;
    }
    
    currentStep++;
    updateStepDisplay();
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Show/hide step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.style.display = index + 1 === currentStep ? 'block' : 'none';
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    
    if (currentStep === 3) {
        nextBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar para aprobación';
    } else {
        nextBtn.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>';
    }
}

// File Upload Handling
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        processFiles(files);
        // Reset the input to allow selecting the same file again if needed
        e.target.value = '';
    }
}

function processFiles(files) {
    const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
            showNotification(`Formato no soportado: ${file.name}`, 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            showNotification(`Archivo muy grande: ${file.name} (máx. 50MB)`, 'error');
            return false;
        }
        
        return true;
    });
    
    uploadedFiles = [...uploadedFiles, ...validFiles];
    updateFilePreview();
}

function updateFilePreview() {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">
                <i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-video'}"></i>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        preview.appendChild(fileItem);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilePreview();
}

function clearFilePreview() {
    document.getElementById('filePreview').innerHTML = '';
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    // Force clear the input by cloning and replacing it
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    // Re-attach event listener
    newFileInput.addEventListener('change', handleFileSelect);
    uploadedFiles = [];
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ad Details Validation
function validateAdDetails() {
    const title = document.getElementById('adTitle').value.trim();
    const category = document.getElementById('adCategory').value;
    
    if (!title) {
        showNotification('Por favor ingresá un título para tu anuncio', 'error');
        return false;
    }
    
    if (title.length < 5) {
        showNotification('El título debe tener al menos 5 caracteres', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('Por favor seleccioná una categoría', 'error');
        return false;
    }
    
    // Store ad data
    adData = {
        title: title,
        description: document.getElementById('adDescription').value.trim(),
        category: category,
        targetAudience: document.getElementById('targetAudience').value,
        files: uploadedFiles
    };
    
    return true;
}

function populateReview() {
    const reviewPreview = document.getElementById('reviewPreview');
    const categoryLabels = {
        'food': 'Comida y bebida',
        'retail': 'Retail y moda',
        'services': 'Servicios',
        'entertainment': 'Entretenimiento',
        'health': 'Salud y bienestar',
        'tech': 'Tecnología',
        'other': 'Otro'
    };
    
    const audienceLabels = {
        'teens': 'Adolescentes (13-17)',
        'young-adults': 'Jóvenes adultos (18-25)',
        'adults': 'Adultos (26-40)',
        'mature': 'Adultos maduros (40+)',
        'families': 'Familias'
    };
    
    reviewPreview.innerHTML = `
        <div class="review-item">
            <h5>Título</h5>
            <p>${adData.title}</p>
        </div>
        
        ${adData.description ? `
        <div class="review-item">
            <h5>Descripción</h5>
            <p>${adData.description}</p>
        </div>
        ` : ''}
        
        <div class="review-item">
            <h5>Categoría</h5>
            <p>${categoryLabels[adData.category] || adData.category}</p>
        </div>
        
        ${adData.targetAudience ? `
        <div class="review-item">
            <h5>Audiencia objetivo</h5>
            <p>${audienceLabels[adData.targetAudience] || 'Todas las edades'}</p>
        </div>
        ` : ''}
        
        <div class="review-item">
            <h5>Archivos (${adData.files.length})</h5>
            <div class="review-files">
                ${adData.files.map(file => `
                    <span class="review-file">
                        <i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-video'}"></i>
                        ${file.name}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}

function submitAd() {
    const submitBtn = document.getElementById('nextBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Enviando...';
    
    // Simulate API call
    setTimeout(() => {
        // Store ad in localStorage for demo
        const existingAds = JSON.parse(localStorage.getItem('customerAds') || '[]');
        const newAd = {
            id: 'ad_' + Date.now(),
            ...adData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerId: getCustomerData().id
        };
        
        existingAds.push(newAd);
        localStorage.setItem('customerAds', JSON.stringify(existingAds));
        
        hideUploadModal();
        
        // Show confetti effect for successful submission
        createConfetti();
        
        showNotification('¡Anuncio enviado para aprobación! Te llevamos a "Mis Anuncios" para que puedas seguir el estado.', 'success');
        
        // Redirect to My Ads page after 5 seconds to enjoy confetti
        setTimeout(() => {
            window.location.href = 'my-ads.html#uploaded';
        }, 5000);
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar para aprobación';
    }, 2000);
}

function resetForms() {
    document.getElementById('adDetailsForm').reset();
    document.getElementById('reviewPreview').innerHTML = '';
}

// Add custom styles for review
const reviewStyles = `
    .review-item {
        margin-bottom: 1.5rem;
    }
    
    .review-item h5 {
        color: var(--accent-blue);
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .review-item p {
        color: var(--text-white);
        margin: 0;
        font-size: 1rem;
    }
    
    .review-files {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .review-file {
        background: rgba(79, 195, 247, 0.1);
        color: var(--accent-blue);
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

// Add review styles to document
const reviewStyleSheet = document.createElement('style');
reviewStyleSheet.textContent = reviewStyles;
document.head.appendChild(reviewStyleSheet);

// Availability Grid Management
let currentGridDate = new Date();
let currentGridLocation = 'unicenter';

const locationData = {
    'unicenter': {
        name: 'Unicenter Shopping',
        details: 'Martínez, Buenos Aires • Desde $750/15seg',
        pricing: { 15: 750, 30: 1400, 60: 2500 }
    },
    'tom-shopping': {
        name: 'TOM Shopping',
        details: 'Córdoba Capital • Desde $500/15seg',
        pricing: { 15: 500, 30: 950, 60: 1700 }
    },
    'dot-baires': {
        name: 'Dot Baires',
        details: 'Buenos Aires • Desde $600/15seg',
        pricing: { 15: 600, 30: 1100, 60: 2000 }
    },
    'aeropuerto': {
        name: 'Aeropuerto Ezeiza',
        details: 'Buenos Aires • Desde $1.200/15seg',
        pricing: { 15: 1200, 30: 2200, 60: 4000 }
    },
    'universidad': {
        name: 'Universidad Palermo',
        details: 'Buenos Aires • Desde $450/15seg',
        pricing: { 15: 450, 30: 850, 60: 1500 }
    }
};

function initializeAvailabilityGrid() {
    generateAvailabilityGrid();
    updateGridHeader();
}

function generateAvailabilityGrid() {
    const gridContainer = document.getElementById('availabilityGrid');
    if (!gridContainer) return;
    
    // Create time header
    const timeHeader = document.createElement('div');
    timeHeader.className = 'grid-time-header';
    
    // Empty cell for location label
    timeHeader.appendChild(createTimeHeaderCell('', 'time-label'));
    
    // Hour headers (24 hours)
    for (let hour = 0; hour < 24; hour++) {
        const hourLabel = hour.toString().padStart(2, '0') + ':00';
        timeHeader.appendChild(createTimeHeaderCell(hourLabel, 'hour-label'));
    }
    
    // Create grid row for the location
    const gridRow = document.createElement('div');
    gridRow.className = 'grid-row';
    
    // Location label
    const locationCell = document.createElement('div');
    locationCell.className = 'time-label';
    locationCell.textContent = locationData[currentGridLocation].name.split(' ')[0];
    gridRow.appendChild(locationCell);
    
    // Time slots (24 hours)
    for (let hour = 0; hour < 24; hour++) {
        const cell = createGridCell(hour);
        gridRow.appendChild(cell);
    }
    
    gridContainer.innerHTML = '';
    gridContainer.appendChild(timeHeader);
    gridContainer.appendChild(gridRow);
}

function createTimeHeaderCell(text, className = '') {
    const cell = document.createElement('div');
    cell.className = `time-header-cell ${className}`;
    cell.textContent = text;
    return cell;
}

function createGridCell(hour) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    
    // Generate realistic availability based on location and time
    const availability = generateRealisticAvailability(hour);
    cell.classList.add(availability.status);
    
    // Add click handler for available slots
    if (availability.status === 'available') {
        cell.addEventListener('click', () => {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            reserveTimeSlot(timeSlot);
        });
        cell.title = `Disponible - ${hour.toString().padStart(2, '0')}:00`;
    } else {
        cell.title = `${availability.status === 'occupied' ? 'Ocupado' : 'Reservado'} - ${hour.toString().padStart(2, '0')}:00`;
    }
    
    return cell;
}

function generateRealisticAvailability(hour) {
    // Different availability patterns based on location and time
    const patterns = {
        'unicenter': {
            // Shopping mall - busy afternoons and evenings
            peak: [14, 15, 16, 17, 18, 19, 20],
            closed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        'tom-shopping': {
            peak: [12, 13, 14, 15, 16, 17, 18, 19],
            closed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        'aeropuerto': {
            // Airport - busy mornings and evenings
            peak: [6, 7, 8, 9, 18, 19, 20, 21],
            closed: [2, 3, 4]
        },
        'universidad': {
            // University - busy during class hours
            peak: [9, 10, 11, 14, 15, 16, 17],
            closed: [0, 1, 2, 3, 4, 5, 22, 23]
        },
        'dot-baires': {
            peak: [12, 13, 14, 15, 16, 17, 18],
            closed: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        }
    };
    
    const pattern = patterns[currentGridLocation] || patterns['unicenter'];
    
    if (pattern.closed.includes(hour)) {
        return { status: 'occupied' };
    }
    
    if (pattern.peak.includes(hour)) {
        // 70% chance of being occupied during peak hours
        const rand = Math.random();
        if (rand < 0.7) return { status: 'occupied' };
        if (rand < 0.85) return { status: 'reserved' };
        return { status: 'available' };
    } else {
        // 40% chance of being occupied during off-peak hours
        const rand = Math.random();
        if (rand < 0.4) return { status: 'occupied' };
        if (rand < 0.5) return { status: 'reserved' };
        return { status: 'available' };
    }
}

function updateGridHeader() {
    const locationInfo = document.getElementById('currentLocationInfo');
    const currentDate = document.getElementById('currentGridDate');
    
    if (locationInfo) {
        const location = locationData[currentGridLocation];
        locationInfo.innerHTML = `
            <div class="location-name">${location.name}</div>
            <div class="location-details">${location.details}</div>
        `;
    }
    
    if (currentDate) {
        const today = new Date();
        const isToday = currentGridDate.toDateString() === today.toDateString();
        const isTomorrow = currentGridDate.toDateString() === new Date(today.getTime() + 24*60*60*1000).toDateString();
        
        if (isToday) {
            currentDate.textContent = 'Hoy';
        } else if (isTomorrow) {
            currentDate.textContent = 'Mañana';
        } else {
            currentDate.textContent = new Intl.DateTimeFormat('es-ES', {
                day: 'numeric',
                month: 'short'
            }).format(currentGridDate);
        }
    }
}

function switchGridLocation() {
    const select = document.getElementById('gridLocationSelect');
    currentGridLocation = select.value;
    generateAvailabilityGrid();
    updateGridHeader();
}

function previousGridDate() {
    const today = new Date();
    if (currentGridDate > today) {
        currentGridDate.setDate(currentGridDate.getDate() - 1);
        generateAvailabilityGrid();
        updateGridHeader();
    }
}

function nextGridDate() {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance
    
    if (currentGridDate < maxDate) {
        currentGridDate.setDate(currentGridDate.getDate() + 1);
        generateAvailabilityGrid();
        updateGridHeader();
    }
}

function reserveTimeSlot(timeSlot) {
    // Store the selected slot and redirect to booking
    const bookingData = {
        location: currentGridLocation,
        date: currentGridDate.toISOString(),
        timeSlot: timeSlot
    };
    
    localStorage.setItem('quickBookingData', JSON.stringify(bookingData));
    
    showNotification(`Redirigiendo a reservar ${timeSlot} en ${locationData[currentGridLocation].name}...`, 'success');
    
    setTimeout(() => {
        window.location.href = `booking.html?location=${currentGridLocation}`;
    }, 1000);
}

function showFullCalendar() {
    // Redirect to booking page with current location
    window.location.href = `booking.html?location=${currentGridLocation}`;
}

// Category change handler
document.getElementById('adCategory').addEventListener('change', function() {
    const category = this.value;
    console.log('Category changed to:', category);
    
    // Show/hide personal ads section
    const personalAdsSection = document.getElementById('personalAdsSection');
    if (category === 'personal') {
        personalAdsSection.style.display = 'block';
    } else {
        personalAdsSection.style.display = 'none';
    }
});

// AI Assistant Functions
let currentAISuggestions = null;

function analyzeTitle() {
    const title = document.getElementById('adTitle').value;
    if (!title.trim()) {
        showNotification('Por favor ingresá un título para analizar', 'warning');
        return;
    }
    
    showAIAnalysis('title', title);
}

function analyzeDescription() {
    const description = document.getElementById('adDescription').value;
    if (!description.trim()) {
        showNotification('Por favor ingresá una descripción para analizar', 'warning');
        return;
    }
    
    showAIAnalysis('description', description);
}

function showAIAnalysis(type, content) {
    const panel = document.getElementById('aiAssistantPanel');
    const aiContent = document.getElementById('aiContent');
    
    // Show loading state
    aiContent.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 10px;"></i>
            <p>Analizando tu ${type === 'title' ? 'título' : 'descripción'} con IA...</p>
        </div>
    `;
    
    panel.style.display = 'block';
    
    // Simulate AI analysis
    setTimeout(() => {
        const suggestions = generateAISuggestions(type, content);
        displayAISuggestions(suggestions);
        currentAISuggestions = suggestions;
    }, 2000);
}

function generateAISuggestions(type, content) {
    const suggestions = [];
    
    if (type === 'title') {
        // Analyze title
        const titleLength = content.length;
        const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);
        const hasNumbers = /\d/.test(content);
        const hasExclamation = /[!¡]/.test(content);
        
        let score = 60;
        let improvements = [];
        
        if (titleLength < 30) {
            score -= 10;
            improvements.push('Considerá agregar más detalles específicos');
        }
        if (titleLength > 60) {
            score -= 15;
            improvements.push('Acortá el título para mayor impacto');
        }
        if (!hasEmoji) {
            score -= 5;
            improvements.push('Agregá un emoji para llamar la atención');
        }
        if (!hasNumbers && content.includes('promoción')) {
            score -= 10;
            improvements.push('Incluí números específicos (ej: 50% OFF, 2x1)');
        }
        if (!hasExclamation) {
            score -= 5;
            improvements.push('Agregá signos de exclamación para más energía');
        }
        
        // Generate improved title
        let improvedTitle = content;
        if (!hasEmoji && content.includes('pizza')) {
            improvedTitle = '🍕 ' + improvedTitle;
        }
        if (!hasEmoji && content.includes('promoción')) {
            improvedTitle = '🔥 ' + improvedTitle;
        }
        if (!hasExclamation) {
            improvedTitle = improvedTitle + '!';
        }
        if (content.includes('2x1') || content.includes('promoción')) {
            improvedTitle = improvedTitle.replace('promoción', 'PROMOCIÓN ESPECIAL');
        }
        
        suggestions.push({
            type: 'title',
            score: Math.min(score + 25, 95),
            original: content,
            improved: improvedTitle,
            improvements: improvements,
            explanation: 'Los títulos con emojis, números específicos y signos de exclamación generan +65% más engagement'
        });
        
    } else if (type === 'description') {
        // Analyze description
        const descLength = content.length;
        const hasCallToAction = /compra|pedí|visitá|llamá|reservá|aprovechá/i.test(content);
        const hasBenefits = /gratis|descuento|oferta|especial|nuevo|único/i.test(content);
        
        let score = 65;
        let improvements = [];
        
        if (descLength < 50) {
            score -= 15;
            improvements.push('Agregá más detalles sobre los beneficios');
        }
        if (descLength > 150) {
            score -= 10;
            improvements.push('Acortá la descripción para mayor claridad');
        }
        if (!hasCallToAction) {
            score -= 20;
            improvements.push('Incluí una llamada a la acción clara');
        }
        if (!hasBenefits) {
            score -= 15;
            improvements.push('Destacá los beneficios únicos de tu oferta');
        }
        
        // Generate improved description
        let improvedDesc = content;
        if (!hasCallToAction) {
            improvedDesc += ' ¡Pedí ya y aprovechá esta oferta especial!';
        }
        if (!hasBenefits && !content.includes('especial')) {
            improvedDesc = 'Oferta especial: ' + improvedDesc;
        }
        
        suggestions.push({
            type: 'description',
            score: Math.min(score + 20, 92),
            original: content,
            improved: improvedDesc,
            improvements: improvements,
            explanation: 'Las descripciones con llamadas a la acción claras aumentan las conversiones en +45%'
        });
    }
    
    return suggestions;
}

function displayAISuggestions(suggestions) {
    const aiContent = document.getElementById('aiContent');
    
    let html = '';
    suggestions.forEach(suggestion => {
        html += `
            <div class="ai-suggestion">
                <h5>Análisis de ${suggestion.type === 'title' ? 'título' : 'descripción'}</h5>
                <p>${suggestion.explanation}</p>
                
                <div class="ai-score">
                    <span class="score-label">Puntuación de engagement:</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${suggestion.score}%"></div>
                    </div>
                    <span><strong>${suggestion.score}/100</strong></span>
                </div>
                
                ${suggestion.improvements.length > 0 ? `
                    <div style="margin: 15px 0;">
                        <strong>Mejoras sugeridas:</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${suggestion.improvements.map(imp => `<li>${imp}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="suggestion-text">
                    <strong>Versión optimizada:</strong><br>
                    "${suggestion.improved}"
                </div>
            </div>
        `;
    });
    
    aiContent.innerHTML = html;
}

function applySuggestions() {
    if (!currentAISuggestions) return;
    
    currentAISuggestions.forEach(suggestion => {
        if (suggestion.type === 'title') {
            document.getElementById('adTitle').value = suggestion.improved;
        } else if (suggestion.type === 'description') {
            document.getElementById('adDescription').value = suggestion.improved;
        }
    });
    
    showNotification('¡Sugerencias aplicadas exitosamente!', 'success');
    closeAIPanel();
}

function closeAIPanel() {
    document.getElementById('aiAssistantPanel').style.display = 'none';
    currentAISuggestions = null;
}

// Confetti Effect
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDelay = Math.random() * 3 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(piece);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 5000);
}

// Mock function to simulate ad approval (for demo purposes)
function simulateAdApproval() {
    showNotification('¡Tu anuncio ha sido aprobado!', 'success');
    createConfetti();
}

// Personal ads helper functions
function updatePersonalAdPreview() {
    const category = document.getElementById('adCategory').value;
    const title = document.getElementById('adTitle').value;
    const pushMessage = document.getElementById('pushMessage').value;
    
    if (category === 'personal' && title && pushMessage) {
        console.log('Personal ad preview updated:', { title, pushMessage });
    }
}

 