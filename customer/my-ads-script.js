// My Ads Page JavaScript - Ad management, filtering, and payment flow

let currentFilter = 'all';
let adsData = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadAdsData();
    updateStatsDisplay();
    filterAds('all');
});

function checkAuthentication() {
    const customerData = getCustomerData();
    if (!customerData) {
        window.location.href = 'index.html';
        return;
    }
}

// Sample ads data (in real app, this would come from API)
function loadAdsData() {
    adsData = [
        {
            id: 'ad1',
            title: 'Promoción Pizza 2x1',
            description: 'Promoción especial de pizzas 2x1 todos los martes y miércoles. Válida para pizzas medianas y grandes.',
            category: 'Comida y bebida',
            status: 'approved',
            createdAt: '2025-01-15',
            approvedAt: '2025-01-16',
            type: 'image',
            image: '../cafe-martinez.jpg',
            hasBooking: false
        },
        {
            id: 'ad2',
            title: 'Video institucional restaurante',
            description: 'Video promocional mostrando el ambiente y especialidades del restaurante.',
            category: 'Comida y bebida',
            status: 'pending',
            createdAt: '2025-01-20',
            type: 'video',
            estimatedApproval: '24-48 horas'
        },
        {
            id: 'ad3',
            title: 'Oferta especial hamburguesas',
            description: 'Promoción de hamburguesas con descuento especial para el fin de semana.',
            category: 'Comida y bebida',
            status: 'rejected',
            createdAt: '2025-01-17',
            rejectedAt: '2025-01-18',
            rejectionReason: 'La imagen no cumple con la resolución mínima requerida (1920x1080px).',
            type: 'image',
            image: '../whooper.jpg'
        },
        {
            id: 'ad4',
            title: 'Descuento en tecnología',
            description: 'Descuentos especiales en smartphones, laptops y accesorios tecnológicos.',
            category: 'Tecnología',
            status: 'published',
            createdAt: '2025-01-10',
            publishedAt: '2025-01-10',
            type: 'image',
            image: '../image-scanning.png',
            location: 'Unicenter Shopping',
            views: 1247,
            endDate: '2025-01-25'
        },
        {
            id: 'ad5',
            title: 'Curso de inglés online',
            description: 'Clases de inglés online con profesores nativos. Primera clase gratis.',
            category: 'Educación',
            status: 'approved',
            createdAt: '2025-01-21',
            approvedAt: '2025-01-22',
            type: 'image',
            hasBooking: false,
            readyForPayment: true
        },
        {
            id: 'ad6',
            title: 'Spa y relajación',
            description: 'Tratamientos de spa y masajes relajantes con descuentos especiales.',
            category: 'Salud y bienestar',
            status: 'pending',
            createdAt: '2025-01-23',
            type: 'image',
            estimatedApproval: '12-24 horas'
        }
    ];
}

// Update stats display
function updateStatsDisplay() {
    const stats = {
        approved: adsData.filter(ad => ad.status === 'approved').length,
        pending: adsData.filter(ad => ad.status === 'pending').length,
        rejected: adsData.filter(ad => ad.status === 'rejected').length,
        published: adsData.filter(ad => ad.status === 'published').length
    };
    
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('rejectedCount').textContent = stats.rejected;
    document.getElementById('publishedCount').textContent = stats.published;
}

// Filter ads by status
function filterAds(status) {
    currentFilter = status;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === status) {
            btn.classList.add('active');
        }
    });
    
    // Filter ad cards
    const adCards = document.querySelectorAll('.ad-card');
    let visibleCount = 0;
    
    adCards.forEach(card => {
        const cardStatus = card.dataset.status;
        const shouldShow = status === 'all' || cardStatus === status;
        
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
            visibleCount++;
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('emptyState');
    if (visibleCount === 0) {
        setTimeout(() => {
            emptyState.style.display = 'block';
        }, 350);
    } else {
        emptyState.style.display = 'none';
    }
}

// Preview ad
function previewAd(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad) return;
    
    const previewContainer = document.getElementById('previewContainer');
    
    if (ad.type === 'image' && ad.image) {
        previewContainer.innerHTML = `
            <img src="${ad.image}" alt="${ad.title}" />
        `;
    } else if (ad.type === 'video') {
        previewContainer.innerHTML = `
            <div style="color: var(--text-gray); text-align: center; padding: 2rem;">
                <i class="fas fa-video" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-blue);"></i>
                <h4 style="color: var(--text-white); margin-bottom: 0.5rem;">${ad.title}</h4>
                <p>Vista previa del video no disponible en demo</p>
            </div>
        `;
    } else {
        previewContainer.innerHTML = `
            <div style="color: var(--text-gray); text-align: center; padding: 2rem;">
                <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; color: var(--success-green);"></i>
                <h4 style="color: var(--text-white); margin-bottom: 0.5rem;">${ad.title}</h4>
                <p>Vista previa de imagen no disponible en demo</p>
            </div>
        `;
    }
    
    document.getElementById('previewModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hidePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const previewModal = document.getElementById('previewModal');
    if (event.target === previewModal) {
        hidePreviewModal();
    }
}

// Proceed to booking (for approved ads)
function proceedToBooking(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad || ad.status !== 'approved') {
        showNotification('Solo los anuncios aprobados pueden proceder a reservar espacio', 'error');
        return;
    }
    
    // Store selected ad for booking flow
    localStorage.setItem('selectedAdForBooking', JSON.stringify(ad));
    
    showNotification('Redirigiendo a selección de espacio...', 'success');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Edit ad
function editAd(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad) return;
    
    if (ad.status === 'published') {
        showNotification('No se puede editar un anuncio que está publicado', 'error');
        return;
    }
    
    // Store ad data for editing
    localStorage.setItem('editingAd', JSON.stringify(ad));
    
    showNotification('Redirigiendo al editor de anuncios...', 'info');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html#edit';
    }, 1000);
}

// Resubmit rejected ad
function resubmitAd(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad || ad.status !== 'rejected') return;
    
    // Store ad data for resubmission
    localStorage.setItem('resubmittingAd', JSON.stringify(ad));
    
    showNotification('Redirigiendo para corregir y reenviar anuncio...', 'info');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html#resubmit';
    }, 1000);
}

// View stats for published ads
function viewStats(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad || ad.status !== 'published') return;
    
    showNotification('Vista de estadísticas próximamente disponible', 'info');
}

// Extend campaign for published ads
function extendCampaign(adId) {
    const ad = adsData.find(a => a.id === adId);
    if (!ad || ad.status !== 'published') return;
    
    const confirmExtend = confirm(`¿Querés extender la campaña "${ad.title}"?\n\nEsto te llevará al proceso de reserva de espacios adicionales.`);
    
    if (confirmExtend) {
        localStorage.setItem('extendingCampaign', JSON.stringify(ad));
        showNotification('Redirigiendo para extender campaña...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

// Utility function to get category icon
function getCategoryIcon(category) {
    const icons = {
        'Comida y bebida': 'fa-utensils',
        'Tecnología': 'fa-laptop',
        'Educación': 'fa-graduation-cap',
        'Salud y bienestar': 'fa-spa',
        'Retail y moda': 'fa-shopping-bag',
        'Servicios': 'fa-handshake',
        'Entretenimiento': 'fa-film'
    };
    
    return icons[category] || 'fa-tag';
}

// Handle page navigation from other pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if coming from dashboard with specific action
    const hash = window.location.hash;
    
    if (hash === '#uploaded') {
        showNotification('¡Anuncio enviado para aprobación exitosamente!', 'success');
        // Remove hash
        history.replaceState(null, null, window.location.pathname);
    }
});

// Enhanced notification function (if not already defined)
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Add animation
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 100);
    }
} 