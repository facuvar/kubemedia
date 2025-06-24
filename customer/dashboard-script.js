// Dashboard JavaScript - Location filtering, upload workflow, and interactions

let currentStep = 1;
let uploadedFiles = [];
let adData = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeFilters();
    initializeUpload();
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
    processFiles(files);
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
    document.getElementById('fileInput').value = '';
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
        showNotification('¡Anuncio enviado para aprobación! Te llevamos a "Mis Anuncios" para que puedas seguir el estado.', 'success');
        
        // Redirect to My Ads page after 2 seconds
        setTimeout(() => {
            window.location.href = 'my-ads.html#uploaded';
        }, 2000);
        
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