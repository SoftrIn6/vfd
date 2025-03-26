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

  // Function to fetch user profile
  async function fetchUserProfile() {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUserData&email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      if (data.status === "success") {
        localStorage.setItem("userData", JSON.stringify(data.user))
      } else {
        console.error("Failed to fetch user profile:", data.message)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Verify session with server
  try {
    const response = await fetch(
      `${GOOGLE_SCRIPT_URL}?action=verifySession&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`,
    )
    const data = await response.json()

    if (data.status !== "success") {
      // Session invalid, redirect to login
      localStorage.removeItem("sessionToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userData")
      window.location.href = "login.html"
    } else {
      // Session valid, update user data if needed
      if (!localStorage.getItem("userData")) {
        fetchUserProfile()
      }
    }
  } catch (error) {
    console.error("Auth check error:", error)
    // On error, continue but log the issue
  }
})

