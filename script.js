// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Fix admin redirections to use relative URLs
    fixAdminRedirections();
    
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // CTA buttons functionality
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-hero, .btn-cta');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate demo request (you can replace this with actual functionality)
            const buttonText = this.textContent;
            
            if (buttonText.includes('demo') || buttonText.includes('Demo')) {
                showDemoModal();
            } else if (buttonText.includes('Hablemos')) {
                window.open('https://wa.me/5491151109844?text=Hola! Me interesa conocer más sobre Kube para Brand Plus', '_blank');
            }
        });
    });

    // Contact info click handlers
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.toLowerCase();
            
            if (text.includes('whatsapp')) {
                window.open('https://wa.me/5491151109844?text=Hola! Me interesa conocer más sobre Kube', '_blank');
            } else if (text.includes('contacto@kube.com')) {
                window.open('mailto:contacto@kube.com?subject=Consulta sobre Kube&body=Hola, me interesa conocer más sobre la solución Kube para Brand Plus.', '_blank');
            }
        });
        
        // Add pointer cursor
        item.style.cursor = 'pointer';
    });

    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const animatedElements = document.querySelectorAll('.step, .benefit-item, .demo-content');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
            header.style.backdropFilter = 'blur(15px)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Video placeholder interaction
    const videoPlaceholders = document.querySelectorAll('.video-placeholder, .video-placeholder-large');
    
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            // Simulate video play (replace with actual video functionality)
            this.style.opacity = '0.5';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 500);
        });
        
        placeholder.style.cursor = 'pointer';
    });
});

// Demo modal functionality
function showDemoModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 3rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;

    modalContent.innerHTML = `
        <h2 style="margin-bottom: 1.5rem; color: #000;">¡Gracias por tu interés!</h2>
        <p style="margin-bottom: 2rem; color: #333; line-height: 1.6;">
            Nos pondremos en contacto contigo pronto para programar una demo personalizada de Kube.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="closeModal()" style="
                background: #000;
                color: white;
                border: none;
                padding: 12px 24px;
                cursor: pointer;
                font-weight: 600;
            ">Cerrar</button>
            <button onclick="contactWhatsApp()" style="
                background: #25D366;
                color: white;
                border: none;
                padding: 12px 24px;
                cursor: pointer;
                font-weight: 600;
            ">Contactar por WhatsApp</button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Show modal with animation
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);

    // Close modal on overlay click
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Store modal reference for closing
    window.currentModal = modalOverlay;
}

function closeModal() {
    if (window.currentModal) {
        window.currentModal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(window.currentModal);
            window.currentModal = null;
        }, 300);
    }
}

function contactWhatsApp() {
    window.open('https://wa.me/5491151109844?text=Hola! Me interesa solicitar una demo de Kube para Brand Plus', '_blank');
    closeModal();
}

// Add some hover effects with JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const benefits = document.querySelectorAll('.benefit-item');

    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });

    benefits.forEach(benefit => {
        benefit.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        benefit.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });
});

// Function to fix admin redirections and ensure relative URLs
function fixAdminRedirections() {
    // Find any elements that might redirect to admin with port
    const adminLinks = document.querySelectorAll('a[href*="admin"], button[onclick*="admin"], .btn-demo-admin');
    
    adminLinks.forEach(element => {
        if (element.tagName === 'A') {
            // Fix href attributes
            let href = element.getAttribute('href');
            if (href && href.includes(':8080')) {
                href = href.replace(/http:\/\/[^:]+:8080/, '');
                href = href.replace(/https:\/\/[^:]+:8080/, '');
                element.setAttribute('href', href);
            }
        } else if (element.tagName === 'BUTTON' || element.classList.contains('btn-demo-admin')) {
            // Add click handler for admin demo buttons
            element.addEventListener('click', function(e) {
                e.preventDefault();
                // Redirect to admin using relative URL
                window.location.href = './admin/';
            });
        }
    });
    
    // Also check for any window.location redirections in other scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes(':8080')) {
            console.warn('Found hardcoded port in script, please review:', script);
        }
    });
}

// Override window.location to prevent hardcoded ports
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
    get: function() {
        return originalLocation;
    },
    set: function(url) {
        // Clean any hardcoded ports from URLs
        if (typeof url === 'string' && url.includes(':8080')) {
            url = url.replace(/http:\/\/[^:]+:8080/, '');
            url = url.replace(/https:\/\/[^:]+:8080/, '');
            // If it's just admin path, make it relative
            if (url.includes('/admin')) {
                url = url.replace(/.*\/admin/, './admin');
            }
        }
        originalLocation.href = url;
    }
}); 