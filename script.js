let currentUser = null;

// Mock Search Data
const searchDatabase = [
    { type: 'Airport', title: 'London Heathrow', sub: 'LHR - London, United Kingdom', icon: 'fa-plane-arrival' },
    { type: 'Airport', title: 'John F. Kennedy', sub: 'JFK - New York, USA', icon: 'fa-plane-departure' },
    { type: 'Airport', title: 'Paris Charles de Gaulle', sub: 'CDG - Paris, France', icon: 'fa-plane' },
    { type: 'Airport', title: 'Tokyo Narita', sub: 'NRT - Tokyo, Japan', icon: 'fa-map-marker-alt' },
    { type: 'Airport', title: 'Dubai International', sub: 'DXB - Dubai, UAE', icon: 'fa-city' },
    { type: 'Flight', title: 'SW-102 to New York', sub: 'Departing 10:30 AM', icon: 'fa-plane-departure' },
    { type: 'Flight', title: 'SW-442 to London', sub: 'Boarding Now', icon: 'fa-clock' },
    { type: 'Aircraft', title: 'Boeing 787 Dreamliner', sub: 'Fleet Info', icon: 'fa-info-circle' },
    { type: 'Service', title: 'Online Check-in', sub: 'Manage your flight', icon: 'fa-check-circle' },
    { type: 'Service', title: 'Flight Status', sub: 'Real-time updates', icon: 'fa-search-location' },
    { type: 'Service', title: 'Manage My Booking', sub: 'View/Change trip', icon: 'fa-calendar-alt' },
    { type: 'Service', title: 'Flight Schedule', sub: 'View all routes', icon: 'fa-list-alt' },
    { type: 'Service', title: 'Book a Flight', sub: 'Start your journey', icon: 'fa-plus-circle' }
];

// Mock Notifications Data
let notifications = [
    { id: 1, text: 'Your flight SW-102 to New York is on time. Gate 12B.', time: '2 mins ago', icon: 'fa-plane', unread: true },
    { id: 2, text: 'Membership Update: You are now a Gold Member!', time: '1 hour ago', icon: 'fa-crown', unread: true },
    { id: 3, text: 'Flash Sale: 20% off all flights to Paris this weekend.', time: '5 hours ago', icon: 'fa-percentage', unread: true }
];

// Modal Functions
function openSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        clearFormErrors('signInForm');
    }
}

function openSignUpModal() {
    const modal = document.getElementById('signUpModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSignUpModal() {
    const modal = document.getElementById('signUpModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        clearFormErrors('signUpForm');
    }
}

function switchToSignUp() {
    closeSignInModal();
    openSignUpModal();
}

function switchToSignIn() {
    closeSignUpModal();
    openSignInModal();
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const errorElement = input.nextElementSibling;
    input.classList.add('error');
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.textContent = message;
    }
}

function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('form-error')) {
            errorElement.textContent = '';
        }
    });
}

// Authentication Logic
function handleSignIn(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('#signInEmail').value;
    const password = form.querySelector('#signInPassword').value;

    clearFormErrors('signInForm');

    let isValid = true;
    if (!validateEmail(email)) {
        showError('signInEmail', 'Please enter a valid email');
        isValid = false;
    }
    if (!password) {
        showError('signInPassword', 'Password is required');
        isValid = false;
    }

    if (isValid) {
        fetch('api/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateUIForLoggedInUser();
                    closeSignInModal();
                    showNotification(`Welcome back, ${data.user.name}!`, 'fa-check');
                } else {
                    showError('signInPassword', data.error || 'Invalid email or password');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                showNotification('Server error. Please try again later.', 'fa-exclamation-circle');
            });
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#signUpName').value;
    const email = form.querySelector('#signUpEmail').value;
    const password = form.querySelector('#signUpPassword').value;
    const confirmPassword = form.querySelector('#signUpConfirmPassword').value;
    const terms = form.querySelector('input[name="terms"]').checked;

    clearFormErrors('signUpForm');

    let isValid = true;
    if (!name || name.length < 2) {
        showError('signUpName', 'Name is required');
        isValid = false;
    }
    if (!validateEmail(email)) {
        showError('signUpEmail', 'Valid email is required');
        isValid = false;
    }
    if (!validatePassword(password)) {
        showError('signUpPassword', 'Min 6 characters');
        isValid = false;
    }
    if (password !== confirmPassword) {
        showError('signUpConfirmPassword', 'Passwords do not match');
        isValid = false;
    }
    if (!terms) {
        alert('Please accept terms and conditions');
        isValid = false;
    }

    if (isValid) {
        fetch('api/auth.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateUIForLoggedInUser();
                    closeSignUpModal();
                    showNotification('Account created successfully!', 'fa-user-plus');
                } else {
                    showError('signUpEmail', data.error || 'Registration failed');
                }
            })
            .catch(err => {
                console.error('Registration error:', err);
                showNotification('Server error. Please try again later.', 'fa-exclamation-circle');
            });
    }
}

function signOut() {
    fetch('api/auth.php?action=logout')
        .then(() => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateUIForLoggedInUser();
            showNotification('Signed out successfully', 'fa-sign-out-alt');

            // Redirect to home if on a protected page
            const protectedPages = ['profile.html', 'bookings.html', 'mileage.html'];
            const currentPage = window.location.pathname.split('/').pop();
            if (protectedPages.includes(currentPage)) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
}

function updateUIForLoggedInUser() {
    const signInBtns = document.querySelectorAll('.btn-sign-in');
    const signUpBtns = document.querySelectorAll('.btn-sign-up');
    const userMenu = document.getElementById('userMenu');

    if (currentUser) {
        signInBtns.forEach(btn => btn.style.display = 'none');
        signUpBtns.forEach(btn => btn.style.display = 'none');
        if (userMenu) userMenu.style.display = 'block';
    } else {
        signInBtns.forEach(btn => btn.style.display = 'block');
        signUpBtns.forEach(btn => btn.style.display = 'block');
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Notifications
function showNotification(message, iconClass = 'fa-info-circle') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.animation = 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    notification.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('navbarSearch');
    const searchResults = document.getElementById('searchResults');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const filtered = searchDatabase.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.sub.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );

        displaySearchResults(filtered);
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Handle Search Button Click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Focus handler
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            searchResults.classList.add('active');
        }
    });
}

function performSearch(query) {
    if (!query || query.trim().length < 2) {
        showNotification('Please enter at least 2 characters to search.', 'fa-exclamation-circle');
        return;
    }

    const trimmedQuery = query.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');

    // Find exact or best match
    const match = searchDatabase.find(item =>
        item.title.toLowerCase() === trimmedQuery ||
        item.title.toLowerCase().includes(trimmedQuery)
    );

    if (match) {
        handleResultClick(match.title, match.type);
    } else {
        showNotification(`No specific results for "${query}". Showing general info...`, 'fa-search');
        // Optionally redirect to a general search page if one existed
    }

    if (searchResults) searchResults.classList.remove('active');
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No matches found... Try "London" or "Boeing"</div>';
    } else {
        searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="handleResultClick('${item.title}', '${item.type}')">
                <i class="fas ${item.icon}"></i>
                <div class="result-info">
                    <span class="result-title">${item.title}</span>
                    <span class="result-subtitle">${item.type} • ${item.sub}</span>
                </div>
            </div>
        `).join('');
    }
    searchResults.classList.add('active');
}

function handleResultClick(title, type) {
    const searchInput = document.getElementById('navbarSearch');
    if (searchInput) searchInput.value = title;

    document.getElementById('searchResults').classList.remove('active');

    // Navigation Logic based on search result
    const pageMap = {
        'london': 'flight-schedule.html',
        'new york': 'flight-status.html',
        'boeing': 'fleet.html',
        'check-in': 'check-in.html',
        'status': 'flight-status.html',
        'schedule': 'flight-schedule.html',
        'booking': 'booking.html',
        'manage': 'manage-booking.html'
    };

    const titleLower = title.toLowerCase();
    let foundPage = null;

    for (const key in pageMap) {
        if (titleLower.includes(key)) {
            foundPage = pageMap[key];
            break;
        }
    }

    if (foundPage) {
        showNotification(`Redirecting to ${title}...`, 'fa-external-link-alt');
        setTimeout(() => {
            window.location.href = foundPage;
        }, 800);
    } else {
        showNotification(`Viewing details for: ${title}`, 'fa-info-circle');
    }
}

// Notification Center Logic
function initializeNotifications() {
    const toggle = document.getElementById('notificationToggle');
    const dropdown = document.getElementById('notificationDropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        renderNotifications();
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if (!list) return;

    const unreadCount = notifications.filter(n => n.unread).length;
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="toggleNotifRead(${n.id})">
            <div class="notif-icon">
                <i class="fas ${n.icon}"></i>
            </div>
            <div class="notif-content">
                <p class="notif-text">${n.text}</p>
                <span class="notif-time">${n.time}</span>
            </div>
        </div>
    `).join('');
}

function toggleNotifRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        notif.unread = false;
        renderNotifications();
    }
}

function markAllRead() {
    notifications.forEach(n => n.unread = false);
    renderNotifications();
    showNotification('All notifications marked as read', 'fa-check-circle');
}

// Function to simulate new update
function simulateNewUpdate(text, icon = 'fa-info-circle') {
    const newNotif = {
        id: Date.now(),
        text: text,
        time: 'Just now',
        icon: icon,
        unread: true
    };
    notifications.unshift(newNotif);
    renderNotifications();
    showNotification('New Update Available!', 'fa-bell');
}

// Video Controls
function initializeVideoControls() {
    const video = document.getElementById('heroVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteUnmuteBtn = document.getElementById('muteUnmuteBtn');

    if (!video) return;

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    }

    if (muteUnmuteBtn) {
        muteUnmuteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteUnmuteBtn.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check backend session
    fetch('api/auth.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                updateUIForLoggedInUser();
            } else {
                currentUser = null;
                localStorage.removeItem('currentUser');
                updateUIForLoggedInUser();
            }
        })
        .catch(() => {
            // Fallback to localStorage if backend is unreachable
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateUIForLoggedInUser();
            }
        });

    // Bind Forms
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    if (signInForm) signInForm.addEventListener('submit', handleSignIn);
    if (signUpForm) signUpForm.addEventListener('submit', handleSignUp);

    // Initializations
    initializeVideoControls();
    initializeSearch();
    initializeNotifications();

    // Simulate an update after 10 seconds for demo
    setTimeout(() => {
        simulateNewUpdate('SkyWings: New seasonal routes to Singapore now open for booking!', 'fa-globe');
    }, 10000);

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.innerHTML = navMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Close modals on background click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeSignInModal();
            closeSignUpModal();
        }
    });
});
