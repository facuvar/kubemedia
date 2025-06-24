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
        alert('Anuncio aprobado exitosamente');
    }
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