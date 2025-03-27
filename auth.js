// SheetDB API endpoint - Replace with your complete SheetDB API endpoint URL
const SHEETDB_API = 'https://sheetdb.io/api/v1/qbn5kbigoxmw3';

// Check if user is logged in - MUST be called on every page
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // If we're on profile.html and not logged in, redirect to login
    if (currentPage === 'profile.html' && (!authToken || !userData.email)) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    
    // If we're on profile.html and logged in, fetch fresh user data
    if (currentPage === 'profile.html' && authToken && userData.email) {
        fetchUserData(userData.email)
            .then(data => {
                if (data) {
                    // Update user data with latest from server
                    localStorage.setItem('userData', JSON.stringify(data));
                    // Update UI if updateUI function exists on this page
                    if (typeof updateUI === 'function') {
                        updateUI(data);
                    }
                } else {
                    // User not found or token invalid
                    console.log('User data not found, redirecting to login');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Error verifying authentication:', error);
                // Use existing data if server request fails
                if (typeof updateUI === 'function') {
                    updateUI(userData);
                }
            });
    }

    return true;
}

// Fetch user data from SheetDB based on email
async function fetchUserData(email) {
    try {
        console.log('Fetching data for:', email);
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            console.log('User data found');
            return data[0]; // Return the first matching user
        }
        console.log('No user data found for this email');
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Login function
async function login(email, password) {
    try {
        // Search for user with matching email and password
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            // User found, create auth token
            const userData = data[0];
            const authToken = 'auth_' + Date.now(); // Simple token generation
            
            // Save auth data to localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            return { status: 'success', data: userData };
        } else {
            return { status: 'error', message: 'Invalid email or password' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { status: 'error', message: 'An error occurred. Please try again.' };
    }
}

// Register function
async function register(userData) {
    try {
        // Check if user already exists
        const checkResponse = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(userData.email)}`);
        const existingUsers = await checkResponse.json();
        
        if (existingUsers && existingUsers.length > 0) {
            return { status: 'error', message: 'Email already registered' };
        }
        
        // Generate a 6-digit referral code
        const referralCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Add default values for new user with proper formatting (0.00)
        const newUser = {
            ...userData,
            total_assets: '0.00',
            quantitative_account: '0.00',
            smart_account: '0.00',
            profit_assets: '0.00',
            total_revenue: '0.00',
            yesterday_earnings: '0.00',
            today_earnings: '0.00',
            commission_today: '0.00',
            referral_code: referralCode
        };
        
        // Add user to SheetDB
        const registerResponse = await fetch(SHEETDB_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: [newUser] })
        });
        
        const result = await registerResponse.json();
        
        if (result.created) {
            return { status: 'success', message: 'Registration successful' };
        } else {
            return { status: 'error', message: 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { status: 'error', message: 'An error occurred. Please try again.' };
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// Add click protection to force login
function addClickProtection() {
    // Only add protection if user is not logged in
    if (!localStorage.getItem('authToken')) {
        document.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        }, { capture: true });
    }
}

// Function to refresh user data periodically
function startDataRefreshInterval() {
    setInterval(() => {
        const authToken = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (authToken && userData.email) {
            fetchUserData(userData.email)
                .then(data => {
                    if (data) {
                        // Update user data with latest from server
                        localStorage.setItem('userData', JSON.stringify(data));
                        // Update UI if updateUI function exists on this page
                        if (typeof updateUI === 'function') {
                            updateUI(data);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error refreshing user data:', error);
                });
        }
    }, 30000); // Refresh every 30 seconds
}

// Start the data refresh interval when the script loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're not on login or register page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html') {
        // Check authentication first
        checkAuth();
        // Start refresh interval
        startDataRefreshInterval();
    }
});
