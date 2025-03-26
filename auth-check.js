// Auth check script to be included in all protected pages
document.addEventListener("DOMContentLoaded", async () => {
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwM3gE9lR2jZNVsrOo20bLHgMdTjMorxnIFE2ZVaJJ-SXycO_tTjCaP8FjRWfZa3cp1Iw/exec"

  // Check if this is a public page (login or register)
  const currentPage = window.location.pathname.split("/").pop()
  const publicPages = ["login.html", "register.html", "reset-password.html"]

  if (publicPages.includes(currentPage)) {
    return // No auth check needed for public pages
  }

  // For protected pages, verify authentication
  const sessionToken = localStorage.getItem("sessionToken")
  const userEmail = localStorage.getItem("userEmail")

  if (!sessionToken || !userEmail) {
    window.location.href = "login.html"
    return
  }

  // Verify session with server
  try {
    console.log("Verifying session for:", userEmail)
    const response = await fetch(
      `${GOOGLE_SCRIPT_URL}?action=verifySession&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`,
    )
    const data = await response.json()

    if (data.status !== "success") {
      console.error("Session verification failed:", data.message)
      // Session invalid, redirect to login
      localStorage.removeItem("sessionToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userData")
      window.location.href = "login.html"
    } else {
      console.log("Session verified successfully")

      // ALWAYS fetch fresh user data on page load - never use cache
      try {
        // Use getUserData to get the raw data directly from the sheet
        const profileResponse = await fetch(
          `${GOOGLE_SCRIPT_URL}?action=getUserData&email=${encodeURIComponent(userEmail)}`,
        )
        const profileData = await profileResponse.json()

        if (profileData.status === "success") {
          console.log("Profile data fetched successfully:", profileData.userData)
          localStorage.setItem("userData", JSON.stringify(profileData.userData))
          localStorage.setItem("lastDataRefresh", new Date().toISOString())

          // If we're on the profile page, update the UI immediately
          if (currentPage === "profile.html" && typeof updateUIWithUserData === "function") {
            try {
              updateUIWithUserData(profileData.userData)
            } catch (e) {
              console.error("Error calling updateUIWithUserData:", e)
            }
          }
        } else {
          console.error("Failed to fetch user profile:", profileData.message)
        }
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError)
      }
    }
  } catch (error) {
    console.error("Auth check error:", error)
    // On error, continue but log the issue
  }
})

