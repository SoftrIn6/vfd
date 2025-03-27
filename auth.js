// SheetDB API endpoint - Replace with your actual SheetDB API URL
const SHEETDB_API = 'https://sheetdb.io/api/v1/qbn5kbigoxmw3';

// Check if user is logged in
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!authToken) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return false;
    }

    // Verify token and get latest user data
    fetchUserData(userData.email)
        .then(data => {
            if (data) {
                // Update user data with latest from server
                localStorage.setItem('userData', JSON.stringify(data));
                updateUI(data);
            } else {
                // Token is invalid or expired
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error verifying authentication:', error);
            // Use existing data if server request fails
            updateUI(userData);
        });

    return true;
}

// Fetch user data from SheetDB
async function fetchUserData(email) {
    try {
        const response = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return data[0]; // Return the first matching user
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Update UI with user data
function updateUI(userData) {
    // Update user profile info
    if (document.querySelector('.user-info')) {
        document.querySelector('.user-info').innerHTML = `
            <div style="font-size: 18px; font-weight: bold;">${userData.username || userData.email.split('@')[0]}</div>
            <div style="color: #666; margin-top: 5px;">${userData.email}</div>
            <i class="fas fa-copy user-copy"></i>
        `;
    }

    // Update total assets
    if (document.querySelector('.total-assets')) {
        document.querySelector('.total-assets').textContent = `$${userData.total_assets || '0'}`;
    }

    // Update account cards on index page
    const cardAmounts = document.querySelectorAll('.card-amount');
    if (cardAmounts.length > 0) {
        cardAmounts[0].textContent = `${userData.total_assets || '0.00'} USDT`;
        if (cardAmounts.length > 1) {
            cardAmounts[1].textContent = `${userData.quantitative_account || '0.00'} USDT`;
        }
    }

    // Update asset values in profile page
    const assetItems = document.querySelectorAll('.asset-item');
    if (assetItems.length > 0) {
        // Update Quantitative Account
        const quantValue = assetItems[0].querySelector('.asset-value');
        if (quantValue) {
            quantValue.textContent = `$${userData.quantitative_account || '0'}`;
        }
        
        // Update Smart Account
        if (assetItems.length > 1) {
            const smartValue = assetItems[1].querySelector('.asset-value');
            if (smartValue) {
                smartValue.textContent = `$${userData.smart_account || '0'}`;
            }
        }
        
        // Update Profit Assets
        if (assetItems.length > 2) {
            const profitValue = assetItems[2].querySelector('.asset-value');
            if (profitValue) {
                profitValue.textContent = `$${userData.profit_assets || '0'}`;
            }
        }
    }

    // Update revenue section in profile page
    if (document.querySelector('.revenue-section')) {
        const totalRevenue = document.querySelector('.revenue-section .total-assets');
        if (totalRevenue) {
            totalRevenue.textContent = `$${userData.total_revenue || '0'}`;
        }

        const revenueItems = document.querySelectorAll('.revenue-grid .asset-item');
        if (revenueItems.length > 0) {
            // Update Yesterday's Earnings
            const yesterdayValue = revenueItems[0].querySelector('.asset-value');
            if (yesterdayValue) {
                yesterdayValue.textContent = `$${userData.yesterday_earnings || '0'}`;
            }
            
            // Update Today's Earnings
            if (revenueItems.length > 1) {
                const todayValue = revenueItems[1].querySelector('.asset-value');
                if (todayValue) {
                    todayValue.textContent = `$${userData.today_earnings || '0'}`;
                }
            }
            
            // Update Commission Today
            if (revenueItems.length > 2) {
                const commissionValue = revenueItems[2].querySelector('.asset-value');
                if (commissionValue) {
                    commissionValue.textContent = `$${userData.commission_today || '0'}`;
                }
            }
        }
    }

    // Update referral code if element exists
    if (document.querySelector('.code-value')) {
        document.querySelector('.code-value').textContent = userData.referral_code || '';
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
        
        // Add default values for new user
        const newUser = {
            ...userData,
            total_assets: '0',
            quantitative_account: '0',
            smart_account: '0',
            profit_assets: '0',
            total_revenue: '0',
            yesterday_earnings: '0',
            today_earnings: '0',
            commission_today: '0',
            referral_code: Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
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
