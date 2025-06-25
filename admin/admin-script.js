document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            window.location.href = "dashboard.html";
        });
    }
    
    // Initialize media modal functionality
    initializeMediaModal();
});

function initializeMediaModal() {
    const modal = document.getElementById("mediaModal");
    const modalClose = document.querySelector(".modal-close");
    const imageContainer = document.getElementById("imageContainer");
    const videoContainer = document.getElementById("videoContainer");
    const previewImage = document.getElementById("previewImage");
    const previewVideo = document.getElementById("previewVideo");
    const modalTitle = document.getElementById("modalTitle");
    
    if (!modal) return; // Exit if modal doesn't exist on this page
    
    // Add click event listeners to all media filenames
    document.querySelectorAll(".media-filename").forEach(filename => {
        filename.addEventListener("click", function() {
            const mediaType = this.dataset.type;
            const mediaSrc = this.dataset.src;
            const fileName = this.textContent;
            
            // Update modal title
            modalTitle.textContent = `Vista Previa: ${fileName}`;
            
            // Hide both containers first
            imageContainer.classList.remove("active");
            videoContainer.classList.remove("active");
            
            if (mediaType === "image") {
                // Show image
                previewImage.src = mediaSrc;
                imageContainer.classList.add("active");
            } else if (mediaType === "video") {
                // Convert YouTube URL to embed format
                const videoId = extractYouTubeVideoId(mediaSrc);
                if (videoId) {
                    previewVideo.src = `https://www.youtube.com/embed/${videoId}`;
                    videoContainer.classList.add("active");
                }
            }
            
            // Show modal
            modal.style.display = "block";
            document.body.style.overflow = "hidden"; // Prevent background scroll
        });
    });
    
    // Close modal when clicking the X
    modalClose.addEventListener("click", closeModal);
    
    // Close modal when clicking outside of it
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore background scroll
        
        // Clear media sources to stop video playback
        previewImage.src = "";
        previewVideo.src = "";
        
        // Hide containers
        imageContainer.classList.remove("active");
        videoContainer.classList.remove("active");
    }
}

function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function approveAd(adId) {
    if (confirm('Estas seguro de que quieres aprobar este anuncio?')) {
        // Create confetti effect
        createConfetti();
        
        // Show success message
        showNotification('¡Anuncio aprobado exitosamente!', 'success');
        
        // Simulate removing the ad from the list (in a real app, this would be an API call)
        setTimeout(() => {
            const adRow = document.querySelector(`[data-ad-id="${adId}"]`);
            if (adRow) {
                adRow.style.transition = 'all 0.3s ease';
                adRow.style.opacity = '0';
                adRow.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    adRow.remove();
                }, 300);
            }
        }, 1000);
    }
}

// Confetti Effect Function
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        // Random colors
        const colors = ['#ff6b9d', '#667eea', '#6bcf7f', '#ffd93d', '#ff6b6b'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        piece.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
            animation-delay: ${Math.random() * 3}s;
        `;
        
        // Random shapes
        if (i % 2 === 0) {
            piece.style.borderRadius = '50%';
        }
        if (i % 4 === 0) {
            piece.style.transform = 'rotate(45deg)';
        }
        
        confettiContainer.appendChild(piece);
    }
    
    // Add CSS animation if not already added
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
            document.body.removeChild(confettiContainer);
        }
    }, 5000);
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#6bcf7f' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add slide-in animation
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

function rejectAd(adId) {
    if (confirm('Estas seguro de que quieres rechazar este anuncio?')) {
        alert('Anuncio rechazado exitosamente');
    }
}

function downloadProgram() {
    alert('La descarga del programa estara disponible proximamente.');
}

function refreshData() {
    alert('Datos actualizados');
} 