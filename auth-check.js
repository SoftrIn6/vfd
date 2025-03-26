import { verifyUserSession, getUserProfileData } from "./api-client"

// Check if user is logged in and redirect if not
async function requireAuth() {
  const email = sessionStorage.getItem("userEmail")
  const token = sessionStorage.getItem("sessionToken")

  if (!email || !token) {
    window.location.href = "login.html"
    return false
  }

  try {
    const response = await verifyUserSession(email, token)

    if (response.status !== "success") {
      sessionStorage.clear()
      window.location.href = "login.html"
      return false
    }

    return true
  } catch (error) {
    console.error("Auth check error:", error)
    sessionStorage.clear()
    window.location.href = "login.html"
    return false
  }
}

// Fetch user profile data
async function fetchUserProfile() {
  const email = sessionStorage.getItem("userEmail")
  const token = sessionStorage.getItem("sessionToken")

  if (!email || !token) {
    return null
  }

  try {
    const response = await getUserProfileData(email, token)

    if (response.status === "success") {
      return response.userData
    } else {
      console.error("Failed to fetch profile:", response.message)
      return null
    }
  } catch (error) {
    console.error("Profile fetch error:", error)
    return null
  }
}

