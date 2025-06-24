// Booking Page JavaScript - Calendar, Time Slots, and Booking Management

let currentDate = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let selectedAd = null;
let selectedDuration = 15;
let locationData = null;
let additionalBookings = [];

// Location data mapping
const locationsData = {
    'unicenter': {
        name: 'Unicenter Shopping',
        address: 'Paraná 3745, Martínez, Buenos Aires',
        basePrice: 750,
        pricing: { 15: 750, 30: 1400, 60: 2500 }
    },
    'tom-shopping': {
        name: 'TOM Shopping',
        address: 'Av. Rafael Núñez 4000, Córdoba Capital',
        basePrice: 500,
        pricing: { 15: 500, 30: 950, 60: 1700 }
    },
    'dot-baires': {
        name: 'Dot Baires Shopping',
        address: 'Vedia 3626, Saavedra, Buenos Aires',
        basePrice: 850,
        pricing: { 15: 850, 30: 1600, 60: 2900 }
    },
    'ezeiza': {
        name: 'Aeropuerto Internacional Ezeiza',
        address: 'Au. Teniente General Pablo Riccheri, Ezeiza',
        basePrice: 1200,
        pricing: { 15: 1200, 30: 2200, 60: 4000 }
    },
    'up': {
        name: 'Universidad Palermo',
        address: 'Mario Bravo 1259, Recoleta, Buenos Aires',
        basePrice: 450,
        pricing: { 15: 450, 30: 850, 60: 1500 }
    },
    'plaza-oeste': {
        name: 'Plaza Oeste',
        address: 'Av. Cristianía 4750, Caseros, Buenos Aires',
        basePrice: 600,
        pricing: { 15: 600, 30: 1100, 60: 2000 }
    }
};

// Initialize booking page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadLocationData();
    initializeCalendar();
    initializeDurationOptions();
    initializeMyAds();
    
    // Check for quick booking data from dashboard grid
    const quickBookingData = localStorage.getItem('quickBookingData');
    if (quickBookingData) {
        const bookingData = JSON.parse(quickBookingData);
        localStorage.removeItem('quickBookingData'); // Clean up
        
        // Pre-select the date and time slot
        selectedDate = new Date(bookingData.date);
        selectedTimeSlot = bookingData.timeSlot;
        
        // Update calendar and time slots
        generateCalendar();
        generateTimeSlots();
        
        showNotification(`Fecha y horario ${bookingData.timeSlot} pre-seleccionados desde la grilla`, 'success');
    }
    
    updateBookingSummary();
});

function checkAuthentication() {
    const customerData = getCustomerData();
    if (!customerData) {
        window.location.href = 'index.html';
        return;
    }
}

function loadLocationData() {
    const selectedLocationId = localStorage.getItem('selectedLocation') || 'unicenter';
    locationData = locationsData[selectedLocationId];
    
    if (!locationData) {
        locationData = locationsData['unicenter'];
    }
    
    // Update header with location info
    document.getElementById('locationInfo').innerHTML = `
        <h1>${locationData.name}</h1>
        <p><i class="fas fa-map-marker-alt"></i> ${locationData.address}</p>
    `;
    
    // Update price info
    const priceInfo = document.querySelector('.price-info');
    priceInfo.innerHTML = `
        <span class="price-label">Desde</span>
        <span class="price-amount">$${locationData.basePrice}</span>
        <span class="price-unit">/15 seg</span>
    `;
    
    updateDurationPricing();
}

// Calendar Management
function initializeCalendar() {
    generateCalendar();
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update title
    calendarTitle.textContent = new Intl.DateTimeFormat('es-ES', { 
        month: 'long', 
        year: 'numeric' 
    }).format(currentDate);
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
        dayElement.textContent = prevMonthDate.getDate();
        calendarGrid.appendChild(dayElement);
    }
    
    // Add days of current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const date = new Date(year, month, day);
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.onclick = () => selectDate(date);
        
        // Mark today
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Mark selected date
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        // Mark past dates as unavailable
        if (date < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('unavailable');
            dayElement.onclick = null;
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Add remaining cells to complete the grid
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingCells; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(date) {
    selectedDate = date;
    selectedTimeSlot = null; // Reset time slot selection
    
    // Update calendar display
    generateCalendar();
    
    // Update selected date display
    document.getElementById('selectedDate').textContent = 
        new Intl.DateTimeFormat('es-ES', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    
    // Generate time slots for selected date
    generateTimeSlots();
    updateBookingSummary();
    
    // Show campaign continuity section after selecting a date
    showCampaignContinuity();
}

function previousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    generateCalendar();
}

function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    generateCalendar();
}

// Time Slots Management
function generateTimeSlots() {
    const timeSlotsGrid = document.getElementById('timeSlotsGrid');
    
    if (!selectedDate) {
        timeSlotsGrid.innerHTML = `
            <div class="empty-time-slots">
                <i class="fas fa-calendar-times"></i>
                <h4>Seleccioná una fecha</h4>
                <p>Elegí una fecha en el calendario para ver los horarios disponibles</p>
            </div>
        `;
        return;
    }
    
    timeSlotsGrid.innerHTML = '';
    
    // Generate time slots from 9:00 to 22:00 (every 15 minutes)
    const startHour = 9;
    const endHour = 22;
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeSlot = document.createElement('div');
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            timeSlot.className = 'time-slot';
            timeSlot.textContent = timeString;
            timeSlot.onclick = () => selectTimeSlot(timeString);
            
            // Randomly mark some slots as occupied for demo
            const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
            
            if (isOccupied) {
                timeSlot.classList.add('occupied');
                timeSlot.onclick = null;
            } else {
                timeSlot.classList.add('available');
            }
            
            // Mark selected time slot
            if (selectedTimeSlot === timeString) {
                timeSlot.classList.remove('available');
                timeSlot.classList.add('selected');
            }
            
            timeSlotsGrid.appendChild(timeSlot);
        }
    }
}

function selectTimeSlot(timeString) {
    selectedTimeSlot = timeString;
    generateTimeSlots(); // Refresh to show selection
    updateBookingSummary();
}

// Duration Options
function initializeDurationOptions() {
    const durationInputs = document.querySelectorAll('input[name="duration"]');
    durationInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedDuration = parseInt(this.value);
            updateBookingSummary();
        });
    });
}

function updateDurationPricing() {
    if (!locationData) return;
    
    const durationOptions = document.querySelectorAll('.duration-option');
    durationOptions.forEach(option => {
        const input = option.querySelector('input');
        const duration = parseInt(input.value);
        const priceElement = option.querySelector('.duration-price');
        
        if (priceElement && locationData.pricing[duration]) {
            priceElement.textContent = `$${locationData.pricing[duration]}`;
        }
    });
}

// My Ads Management
function initializeMyAds() {
    // Check if coming from "Mis Anuncios" with a pre-selected ad
    const selectedAdFromStorage = localStorage.getItem('selectedAdForBooking');
    let preSelectedAd = null;
    
    if (selectedAdFromStorage) {
        preSelectedAd = JSON.parse(selectedAdFromStorage);
        localStorage.removeItem('selectedAdForBooking'); // Clean up
    }
    
    // For demo purposes, we'll use some static ads
    // In real implementation, this would come from the user's created ads
    const myAds = [
        {
            id: 'ad1',
            title: 'Promoción Pizza 2x1',
            type: 'image',
            status: 'approved'
        },
        {
            id: 'ad2',
            title: 'Video institucional',
            type: 'video',
            status: 'pending'
        },
        {
            id: 'ad3',
            title: 'Oferta especial hamburguesas',
            type: 'image',
            status: 'approved'
        },
        {
            id: 'ad5',
            title: 'Curso de inglés online',
            type: 'image',
            status: 'approved'
        }
    ];
    
    // If there's a pre-selected ad, add it to the list if not already there
    if (preSelectedAd && !myAds.find(ad => ad.id === preSelectedAd.id)) {
        myAds.unshift({
            id: preSelectedAd.id,
            title: preSelectedAd.title,
            type: 'image',
            status: 'approved'
        });
    }
    
    const myAdsList = document.getElementById('myAdsList');
    const existingAds = myAdsList.querySelectorAll('.ad-item:not(.create-new-ad)');
    
    // Remove existing ads except create button
    existingAds.forEach(ad => ad.remove());
    
    // Add ads before create button
    const createButton = myAdsList.querySelector('.create-new-ad');
    
    myAds.forEach(ad => {
        const isPreSelected = preSelectedAd && preSelectedAd.id === ad.id;
        const adElement = document.createElement('div');
        adElement.className = `ad-item ${isPreSelected ? 'selected' : ''}`;
        adElement.innerHTML = `
            <div class="ad-preview">
                <i class="fas ${ad.type === 'video' ? 'fa-video' : 'fa-image'}"></i>
            </div>
            <div class="ad-info">
                <span class="ad-title">${ad.title}</span>
                <span class="ad-status ${ad.status}">${ad.status === 'approved' ? 'Aprobado' : 'Pendiente'}</span>
            </div>
            <button class="btn-select-ad ${ad.status !== 'approved' ? 'disabled' : ''} ${isPreSelected ? 'selected' : ''}" 
                    ${ad.status !== 'approved' ? 'disabled' : ''} 
                    onclick="selectAd('${ad.id}', '${ad.title}')">
                ${isPreSelected ? 'Seleccionado' : ad.status === 'approved' ? 'Usar' : 'Esperando aprobación'}
            </button>
        `;
        
        myAdsList.insertBefore(adElement, createButton);
    });
    
    // Auto-select the pre-selected ad
    if (preSelectedAd) {
        setTimeout(() => {
            selectAd(preSelectedAd.id, preSelectedAd.title);
            showNotification(`Anuncio "${preSelectedAd.title}" seleccionado automáticamente`, 'success');
        }, 500);
    }
}

function selectAd(adId, adTitle) {
    selectedAd = { id: adId, title: adTitle };
    
    // Update visual selection
    document.querySelectorAll('.ad-item').forEach(item => {
        item.classList.remove('selected');
        const button = item.querySelector('.btn-select-ad');
        if (button && !button.disabled) {
            button.textContent = 'Usar';
            button.classList.remove('selected');
        }
    });
    
    // Mark selected ad
    const selectedAdElement = Array.from(document.querySelectorAll('.ad-item')).find(item => {
        const button = item.querySelector('.btn-select-ad');
        return button && button.onclick && button.onclick.toString().includes(adId);
    });
    
    if (selectedAdElement) {
        selectedAdElement.classList.add('selected');
        const button = selectedAdElement.querySelector('.btn-select-ad');
        button.textContent = 'Seleccionado';
        button.classList.add('selected');
    }
    
    updateBookingSummary();
}

function createNewAd() {
    // Redirect to dashboard with upload modal
    window.location.href = 'dashboard.html#upload';
}

// Booking Summary Management - Updated to include continuity
function updateBookingSummary() {
    const summaryElement = document.getElementById('bookingSummary');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryDuration = document.getElementById('summaryDuration');
    const summaryAd = document.getElementById('summaryAd');
    const summaryAdditional = document.getElementById('summaryAdditional');
    const summaryAdditionalDates = document.getElementById('summaryAdditionalDates');
    const totalPrice = document.getElementById('totalPrice');
    const continueButton = document.querySelector('.btn-continue');
    const priceBreakdown = document.getElementById('priceBreakdown');
    const mainBookingPrice = document.getElementById('mainBookingPrice');
    const additionalBookingPrice = document.getElementById('additionalBookingPrice');
    const discountAmount = document.getElementById('discountAmount');
    
    // Update basic summary fields
    summaryDate.textContent = selectedDate ? 
        new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(selectedDate) : '-';
    
    summaryTime.textContent = selectedTimeSlot || '-';
    summaryDuration.textContent = selectedDuration ? `${selectedDuration} segundos` : '-';
    summaryAd.textContent = selectedAd ? selectedAd.title : '-';
    
    // Calculate prices
    const mainPrice = locationData && locationData.pricing[selectedDuration] ? 
        locationData.pricing[selectedDuration] : 0;
    
    let finalTotalPrice = mainPrice;
    let additionalPrice = 0;
    let totalDiscount = 0;
    
    if (additionalBookings.length > 0) {
        const additional = additionalBookings[0];
        additionalPrice = additional.discountedPrice;
        totalDiscount = additional.originalPrice - additional.discountedPrice;
        finalTotalPrice += additionalPrice;
        
        // Show additional dates info
        summaryAdditional.style.display = 'block';
        summaryAdditionalDates.textContent = `${additional.slots} fechas cada ${additional.dayInterval} días`;
        
        // Show price breakdown
        priceBreakdown.style.display = 'block';
        mainBookingPrice.textContent = `$${mainPrice}`;
        additionalBookingPrice.textContent = `$${additional.originalPrice}`;
        discountAmount.textContent = `-$${totalDiscount}`;
    } else {
        summaryAdditional.style.display = 'none';
        priceBreakdown.style.display = 'none';
    }
    
    totalPrice.textContent = `$${finalTotalPrice}`;
    
    // Show/hide summary and enable/disable continue button
    const isComplete = selectedDate && selectedTimeSlot && selectedAd && selectedDuration;
    
    if (isComplete) {
        summaryElement.style.display = 'block';
        continueButton.disabled = false;
    } else {
        summaryElement.style.display = selectedDate || selectedTimeSlot || selectedAd ? 'block' : 'none';
        continueButton.disabled = true;
    }
}

// Payment Process
function proceedToPayment() {
    if (!selectedDate || !selectedTimeSlot || !selectedAd || !selectedDuration) {
        showNotification('Por favor completá todos los campos para continuar', 'error');
        return;
    }
    
    const bookingData = {
        location: locationData,
        date: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        duration: selectedDuration,
        ad: selectedAd,
        price: locationData.pricing[selectedDuration],
        bookingId: 'booking_' + Date.now(),
        customerId: getCustomerData().id,
        status: 'pending_payment',
        createdAt: new Date().toISOString()
    };
    
    // Store booking data
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // For demo, just show success message
    showNotification('¡Reserva creada! Redirigiendo al proceso de pago...', 'success');
    
    setTimeout(() => {
        // In real implementation, redirect to payment page
        showNotification('Funcionalidad de pago próximamente disponible. Tu reserva queda guardada.', 'info');
        
        // Save to bookings history
        const existingBookings = JSON.parse(localStorage.getItem('customerBookings') || '[]');
        existingBookings.push(bookingData);
        localStorage.setItem('customerBookings', JSON.stringify(existingBookings));
        
        // Redirect back to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 1500);
}

// Campaign Continuity Functions
function showCampaignContinuity() {
    if (!selectedDate || !selectedTimeSlot) return;
    
    const continuitySection = document.getElementById('campaignContinuity');
    continuitySection.style.display = 'block';
    
    // Generate dates for each option
    generateContinuityDates(3);
    generateContinuityDates(7);
    generateContinuityDates(10);
    
    // Calculate pricing
    updateContinuityPricing();
}

function generateContinuityDates(dayInterval) {
    const datesContainer = document.getElementById(`dates${dayInterval}days`);
    const baseDate = new Date(selectedDate);
    const dates = [];
    
    // Generate 4 additional dates with the specified interval
    for (let i = 1; i <= 4; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setDate(baseDate.getDate() + (dayInterval * i));
        dates.push(futureDate);
    }
    
    datesContainer.innerHTML = dates.map(date => {
        const dateString = new Intl.DateTimeFormat('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).format(date);
        
        // Randomly assign availability for demo
        const isAvailable = Math.random() > 0.2; // 80% chance of being available
        const status = isAvailable ? 'available' : 'limited';
        const statusText = isAvailable ? 'Disponible' : 'Limitado';
        
        return `
            <div class="date-item">
                <span class="date-text">${dateString}</span>
                <span class="date-status ${status}">${statusText}</span>
            </div>
        `;
    }).join('');
}

function updateContinuityPricing() {
    const basePrice = locationData.pricing[selectedDuration];
    const additionalSlots = 4; // 4 additional bookings
    
    // Calculate prices for each option
    const options = [
        { days: 3, discount: 0.10 },
        { days: 7, discount: 0.15 },
        { days: 10, discount: 0.20 }
    ];
    
    options.forEach(option => {
        const originalPrice = basePrice * additionalSlots;
        const discountedPrice = originalPrice * (1 - option.discount);
        const savings = originalPrice - discountedPrice;
        
        document.getElementById(`originalPrice${option.days}`).textContent = `$${originalPrice}`;
        document.getElementById(`discountedPrice${option.days}`).textContent = `$${discountedPrice}`;
        document.getElementById(`savings${option.days}`).textContent = `$${savings}`;
    });
}

function addContinuity(dayInterval) {
    const option = document.querySelector(`[data-days="${dayInterval}"]`);
    const button = option.querySelector('.btn-add-continuity');
    
    if (button.classList.contains('added')) {
        // Remove continuity
        removeContinuity(dayInterval);
        return;
    }
    
    // Remove other selections first
    document.querySelectorAll('.continuity-option').forEach(opt => {
        opt.classList.remove('selected');
        const btn = opt.querySelector('.btn-add-continuity');
        btn.classList.remove('added');
        btn.innerHTML = '<i class="fas fa-plus"></i> Agregar (' + btn.textContent.split('(')[1];
    });
    
    // Add this selection
    option.classList.add('selected');
    button.classList.add('added');
    button.innerHTML = '<i class="fas fa-check"></i> Agregado';
    
    // Store additional booking info
    const discounts = { 3: 0.10, 7: 0.15, 10: 0.20 };
    const basePrice = locationData.pricing[selectedDuration];
    const additionalSlots = 4;
    const originalPrice = basePrice * additionalSlots;
    const discountedPrice = originalPrice * (1 - discounts[dayInterval]);
    
    additionalBookings = [{
        dayInterval: dayInterval,
        slots: additionalSlots,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discount: discounts[dayInterval]
    }];
    
    updateBookingSummary();
    showNotification(`Continuidad de ${dayInterval} días agregada con ${(discounts[dayInterval] * 100)}% de descuento!`, 'success');
}

function removeContinuity(dayInterval) {
    const option = document.querySelector(`[data-days="${dayInterval}"]`);
    const button = option.querySelector('.btn-add-continuity');
    
    option.classList.remove('selected');
    button.classList.remove('added');
    
    const discountText = dayInterval === 3 ? '10%' : dayInterval === 7 ? '15%' : '20%';
    button.innerHTML = `<i class="fas fa-plus"></i> Agregar (Descuento ${discountText})`;
    
    additionalBookings = [];
    updateBookingSummary();
    showNotification('Continuidad removida', 'info');
}



// Handle dashboard upload redirect
if (window.location.hash === '#upload') {
    // Trigger upload modal when coming from booking page
    setTimeout(() => {
        if (typeof showUploadModal === 'function') {
            showUploadModal();
        }
    }, 500);
} 