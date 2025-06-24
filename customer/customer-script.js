// Customer Panel JavaScript - Modal Management and Form Handling

// Modal Management
function showRegisterForm() {
    hideLoginModal();
    document.getElementById('registerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showLoginModal() {
    hideRegisterModal();
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showRegisterModal() {
    hideLoginModal();
    showRegisterForm();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const registerModal = document.getElementById('registerModal');
    const loginModal = document.getElementById('loginModal');
    
    if (event.target === registerModal) {
        hideRegisterModal();
    }
    if (event.target === loginModal) {
        hideLoginModal();
    }
}

// Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Phone input formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
});

function handleRegistration() {
    const formData = new FormData(document.getElementById('registerForm'));
    const userData = {
        businessName: formData.get('businessName'),
        businessType: formData.get('businessType'),
        contactName: formData.get('contactName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Validate form data
    if (!validateRegistrationForm(userData)) {
        return;
    }
    
    // Simulate API call
    showLoadingState('register');
    
    setTimeout(() => {
        // Simulate successful registration
        localStorage.setItem('customerData', JSON.stringify({
            ...userData,
            id: 'customer_' + Date.now(),
            registrationDate: new Date().toISOString(),
            status: 'active'
        }));
        
        hideLoadingState('register');
        hideRegisterModal();
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Por favor completá todos los campos', 'error');
        return;
    }
    
    // Simulate API call
    showLoadingState('login');
    
    setTimeout(() => {
        // Simulate successful login (accepts any credentials)
        localStorage.setItem('customerData', JSON.stringify({
            id: 'customer_demo',
            businessName: 'Demo Business',
            contactName: 'Usuario Demo',
            email: email,
            registrationDate: new Date().toISOString(),
            status: 'active'
        }));
        
        hideLoadingState('login');
        hideLoginModal();
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1000);
}

function validateRegistrationForm(userData) {
    // Business name validation
    if (!userData.businessName || userData.businessName.length < 2) {
        showNotification('El nombre del negocio debe tener al menos 2 caracteres', 'error');
        return false;
    }
    
    // Business type validation
    if (!userData.businessType) {
        showNotification('Por favor seleccioná el tipo de negocio', 'error');
        return false;
    }
    
    // Contact name validation
    if (!userData.contactName || userData.contactName.length < 2) {
        showNotification('Tu nombre debe tener al menos 2 caracteres', 'error');
        return false;
    }
    
    // Phone validation (basic)
    if (!userData.phone || userData.phone.length < 10) {
        showNotification('Por favor ingresá un número de teléfono válido', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
        showNotification('Por favor ingresá un email válido', 'error');
        return false;
    }
    
    // Password validation
    if (!userData.password || userData.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return false;
    }
    
    return true;
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Argentina phone format: +54 9 11 1234-5678
    if (value.length > 0) {
        if (value.startsWith('54')) {
            value = value.substring(2);
        }
        
        if (value.length <= 10) {
            if (value.length > 6) {
                value = `+54 9 ${value.substring(0, 2)} ${value.substring(2, 6)}-${value.substring(6)}`;
            } else if (value.length > 2) {
                value = `+54 9 ${value.substring(0, 2)} ${value.substring(2)}`;
            } else {
                value = `+54 9 ${value}`;
            }
        }
    }
    
    e.target.value = value;
}

function showLoadingState(formType) {
    const button = formType === 'register' 
        ? document.querySelector('.btn-register')
        : document.querySelector('.btn-login-submit');
    
    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner"></div>
            ${formType === 'register' ? 'Creando cuenta...' : 'Iniciando sesión...'}
        `;
        button.style.opacity = '0.8';
    }
}

function hideLoadingState(formType) {
    const button = formType === 'register' 
        ? document.querySelector('.btn-register')
        : document.querySelector('.btn-login-submit');
    
    if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        
        if (formType === 'register') {
            button.innerHTML = `
                <i class="fas fa-rocket"></i>
                Crear cuenta gratis
            `;
        } else {
            button.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Iniciar sesión
            `;
        }
    }
}

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

// Utility Functions
function isLoggedIn() {
    return localStorage.getItem('customerData') !== null;
}

function getCustomerData() {
    const data = localStorage.getItem('customerData');
    return data ? JSON.parse(data) : null;
}

function logout() {
    localStorage.removeItem('customerData');
    window.location.href = 'index.html';
}

// Add CSS for notifications dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        min-width: 300px;
        max-width: 400px;
        z-index: 1001;
        backdrop-filter: blur(10px);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .notification-show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-white);
    }
    
    .notification-error {
        border-left: 4px solid var(--error-red);
    }
    
    .notification-error .notification-content i {
        color: var(--error-red);
    }
    
    .notification-success {
        border-left: 4px solid var(--success-green);
    }
    
    .notification-success .notification-content i {
        color: var(--success-green);
    }
    
    .notification-info {
        border-left: 4px solid var(--accent-blue);
    }
    
    .notification-info .notification-content i {
        color: var(--accent-blue);
    }
    
    .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: var(--text-gray);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.3s ease;
    }
    
    .notification-close:hover {
        color: var(--text-white);
    }
    
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 