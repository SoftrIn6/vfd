// SheetDB API endpoint - Replace with your actual SheetDB API URL
const SHEETDB_API = 'https://sheetdb.io/api/v1/677wbdnn3l3gx';

// Function to check authentication
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'profile.html') {
        if (!authToken || !userData.email) {
            console.log('User not authenticated. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        fetchUserData(userData.email)
            .then(data => {
                if (data) {
                    localStorage.setItem('userData', JSON.stringify(data));
                    if (typeof updateUI === 'function') {
                        updateUI(data);
                    }
                } else {
                    console.log('User data not found. Redirecting to login.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                if (typeof updateUI === 'function') {
                    updateUI(userData);
                }
            });
    }
}

// Fetch user data from SheetDB
async function fetchUserData(email) {
    try {
        console.log('Fetching data for:', email);
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.length > 0) {
            console.log('User data found:', data[0]);
            return data[0];
        }

        console.log('No user data found for this email.');
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const data = await response.json();

        if (data.length > 0) {
            const userData = data[0];
            const authToken = `auth_${Date.now()}`;

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

// Register function in auth.js
async function register(userData) {
    try {
        // Check if user already exists by email
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(userData.email)}`);
        const data = await response.json();
        console.log("User check response:", data); // Log the response for debugging

        if (data.length > 0) {
            return { status: 'error', message: 'Email already exists' };
        }

        // Create new user data
        const newUser = {
            email: userData.email,
            password: userData.password,
            username: userData.username,
            referralCode: userData.referred_by || '',  // Referral code is optional
            total_assets: 0.00,
            quantitative_account: 0.00,
            smart_account: 0.00,
            profit_assets: 0.00,
            total_revenue: 0.00,
            yesterday_earnings: 0.00,
            commission_today: 0.00
        };

        // Add new user to SheetDB
        const createResponse = await fetch(SHEETDB_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([newUser]) // SheetDB expects an array of objects
        });

        // Log the response to check if it was successful
        const responseData = await createResponse.json();
        console.log("Create user response:", responseData); // Log the response for debugging

        if (createResponse.ok) {
            return { status: 'success', message: 'Registration successful' };
        } else {
            return { status: 'error', message: 'Error registering user. Please try again.' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { status: 'error', message: 'An error occurred. Please try again.' };
    }
}

// Generate referral code (you can customize this function to generate a referral code in your preferred format)
function generateReferralCode() {
    return 'REF' + Math.floor(Math.random() * 1000000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// Periodically refresh user data
function startDataRefreshInterval() {
    setInterval(() => {
        const authToken = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (authToken && userData.email) {
            fetchUserData(userData.email)
                .then(data => {
                    if (data) {
                        localStorage.setItem('userData', JSON.stringify(data));
                        if (typeof updateUI === 'function') {
                            updateUI(data);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error refreshing user data:', error);
                });
        }
    }, 30000);
}

// Run authentication check on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html') {
        checkAuth();
        startDataRefreshInterval();
    }
});

// UI Update Function (Place this in profile.html)
function updateUI(userData) {
    document.getElementById('userId').textContent = userData.id || 'N/A';
    document.getElementById('username').textContent = userData.username || 'N/A';
    document.getElementById('userEmail').textContent = userData.email || 'N/A';
    document.getElementById('userPassword').textContent = userData.password || 'N/A';
    document.getElementById('referralCode').textContent = userData.referralCode || 'N/A';
    document.getElementById('totalAssets').textContent = userData.total_assets || '0.00';
    document.getElementById('quantitativeAccount').textContent = userData.quantitative_account || '0.00';
    document.getElementById('smartAccount').textContent = userData.smart_account || '0.00';
    document.getElementById('profitAssets').textContent = userData.profit_assets || '0.00';
    document.getElementById('totalRevenue').textContent = userData.total_revenue || '0.00';
    document.getElementById('yesterdayEarnings').textContent = userData.yesterday_earnings || '0.00';
    document.getElementById('commissionToday').textContent = userData.commission_today || '0.00';
}

// Add event listener for the registration form submission
document.getElementById('register-btn').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    // Call the register function
    register(email, password, username)
        .then(result => {
            if (result.status === 'success') {
                alert(result.message);
                window.location.href = 'login.html'; // Redirect to login page after successful registration
            } else {
                alert(result.message); // Display error message
            }
        })
        .catch(error => {
            console.error('Registration failed:', error);
        });
});
