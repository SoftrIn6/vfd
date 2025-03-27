// SheetDB API endpoint - Replace with your actual SheetDB API URL
const SHEETDB_API = 'https://sheetdb.io/api/v1/qbn5kbigoxmw3';

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
    document.getElementById('userEmail').textContent = userData.email || 'N/A';
    document.getElementById('totalAssets').textContent = userData.total_assets || '0.00';
    document.getElementById('profitAssets').textContent = userData.profit_assets || '0.00';
}
