// Session management for Google Apps Script website

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuw-95QUHOG_CzfCzflK4eFsriWs3QXhcRn7icM4EwRDGOUXkFInwPtwSihoj3vJQVhg/exec"; // Replace with actual script ID

// Check if user is logged in by verifying session token
async function checkSession() {
    const sessionToken = localStorage.getItem("sessionToken");
    const userEmail = localStorage.getItem("userEmail");

    if (!sessionToken || !userEmail) return false;

    try {
        const response = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=verifySession&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`
        );
        const data = await response.json();
        return data.status === "success";
    } catch (error) {
        console.error("Session verification error:", error);
        return false;
    }
}

// Redirect to login if not authenticated
async function requireAuth() {
    const isLoggedIn = await checkSession();
    if (!isLoggedIn) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Log out user by clearing session
function logoutUser() {
    const userEmail = localStorage.getItem("userEmail");
    const sessionToken = localStorage.getItem("sessionToken");

    if (userEmail && sessionToken) {
        fetch(
            `${GOOGLE_SCRIPT_URL}?action=logout&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`
        )
            .then((response) => response.json())
            .then((data) => {
                console.log("Logout response:", data);
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    }

    clearSessionAndRedirect();
}

// Function to clear session and redirect to login
function clearSessionAndRedirect() {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    window.location.href = "login.html";
}

// Fetch the latest user profile
async function fetchUserProfile(useCache = false) {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        console.error("No user email found");
        return null;
    }

    // Use cache if available
    const cachedUserData = localStorage.getItem("userData");
    if (cachedUserData && useCache) {
        console.log("Using cached user data:", JSON.parse(cachedUserData));
        return JSON.parse(cachedUserData);
    }

    try {
        console.log("Fetching fresh user profile for:", userEmail);
        const response = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getUserData&email=${encodeURIComponent(userEmail)}&nocache=${new Date().getTime()}`
        );
        const data = await response.json();

        if (data.status === "success") {
            localStorage.setItem("userData", JSON.stringify(data.userData));
            localStorage.setItem("lastDataRefresh", new Date().toISOString());
            return data.userData;
        } else {
            console.error("Error fetching profile:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
        return null;
    }
}

// Force refresh user data
async function refreshUserData() {
    localStorage.removeItem("userData");
    return await fetchUserProfile(false);
}

// Check if data is stale (older than given minutes)
function isDataStale(minutes = 5) {
    const lastRefresh = localStorage.getItem("lastDataRefresh");
    if (!lastRefresh) return true;

    const lastRefreshTime = new Date(lastRefresh).getTime();
    const currentTime = new Date().getTime();
    return currentTime - lastRefreshTime > minutes * 60 * 1000;
}
