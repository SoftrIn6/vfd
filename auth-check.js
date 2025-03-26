// Auth check script to be included in all protected pages
document.addEventListener("DOMContentLoaded", async () => {
    const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbxuw-95QUHOG_CzfCzflK4eFsriWs3QXhcRn7icM4EwRDGOUXkFInwPtwSihoj3vJQVhg/exec"; // Replace with your actual script ID

    const currentPage = window.location.pathname.split("/").pop();
    const publicPages = ["login.html", "register.html", "reset-password.html"];

    // Skip authentication check for public pages
    if (publicPages.includes(currentPage)) return;

    const sessionToken = localStorage.getItem("sessionToken");
    const userEmail = localStorage.getItem("userEmail");

    // Redirect to login if no session
    if (!sessionToken || !userEmail) {
        window.location.href = "login.html";
        return;
    }

    try {
        console.log("Verifying session for:", userEmail);
        const response = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=verifySession&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`
        );
        const data = await response.json();

        if (data.status !== "success") {
            console.error("Session verification failed:", data.message);
            clearSessionAndRedirect();
        } else {
            console.log("Session verified successfully");
            await fetchAndUpdateUserProfile(userEmail, currentPage);
        }
    } catch (error) {
        console.error("Auth check error:", error);
    }
});

// Function to fetch and update user profile
async function fetchAndUpdateUserProfile(userEmail, currentPage) {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuw-95QUHOG_CzfCzflK4eFsriWs3QXhcRn7icM4EwRDGOUXkFInwPtwSihoj3vJQVhg/exec";

    try {
        console.log("Fetching fresh user profile for:", userEmail);
        const profileResponse = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getUserData&email=${encodeURIComponent(userEmail)}&nocache=${new Date().getTime()}`
        );
        const profileData = await profileResponse.json();

        if (profileData.status === "success") {
            console.log("Profile data fetched successfully:", profileData.userData);
            localStorage.setItem("userData", JSON.stringify(profileData.userData));
            localStorage.setItem("lastDataRefresh", new Date().toISOString());

            // Auto-update profile UI if on profile page
            if (currentPage === "profile.html" && typeof updateUIWithUserData === "function") {
                try {
                    updateUIWithUserData(profileData.userData);
                } catch (e) {
                    console.error("Error calling updateUIWithUserData:", e);
                }
            }
        } else {
            console.error("Failed to fetch user profile:", profileData.message);
        }
    } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
    }
}

// Function to clear session and redirect to login
function clearSessionAndRedirect() {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    window.location.href = "login.html";
}
