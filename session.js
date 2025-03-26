// Session management for Google Apps Script website

// Define GOOGLE_SCRIPT_URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwM3gE9lR2jZNVsrOo20bLHgMdTjMorxnIFE2ZVaJJ-SXycO_tTjCaP8FjRWfZa3cp1Iw/exec" // Replace with your actual Google Script URL

// Generate a random session token
function generateSessionToken(length = 32) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

// Check if user is logged in by verifying session token
function checkSession() {
  const sessionToken = localStorage.getItem("sessionToken")
  const userEmail = localStorage.getItem("userEmail")

  if (!sessionToken || !userEmail) {
    return false
  }

  // Verify session with Google Apps Script
  return fetch(
    `${GOOGLE_SCRIPT_URL}?action=verifySession&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`,
  )
    .then((response) => response.json())
    .then((data) => {
      return data.status === "success"
    })
    .catch((error) => {
      console.error("Session verification error:", error)
      return false
    })
}

// Redirect to login if not authenticated
async function requireAuth() {
  const isLoggedIn = await checkSession()
  if (!isLoggedIn) {
    window.location.href = "login.html"
    return false
  }
  return true
}

// Log out user by clearing session
function logoutUser() {
  const userEmail = localStorage.getItem("userEmail")
  const sessionToken = localStorage.getItem("sessionToken")

  if (userEmail && sessionToken) {
    // Notify server about logout
    fetch(
      `${GOOGLE_SCRIPT_URL}?action=logout&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Logout response:", data)
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

  // Clear local storage
  localStorage.removeItem("sessionToken")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userData")

  // Redirect to login page
  window.location.href = "login.html"
}

// Fetch user profile data - always get fresh data by default
async function fetchUserProfile(useCache = false) {
  const userEmail = localStorage.getItem("userEmail")
  const sessionToken = localStorage.getItem("sessionToken")

  if (!userEmail || !sessionToken) {
    console.error("No user email or session token found")
    return null
  }

  // If we have cached user data and are allowed to use cache, return it
  const cachedUserData = localStorage.getItem("userData")
  if (cachedUserData && useCache) {
    console.log("Using cached user data:", JSON.parse(cachedUserData))
    return JSON.parse(cachedUserData)
  }

  try {
    console.log("Fetching fresh user profile for:", userEmail)
    const response = await fetch(
      `${GOOGLE_SCRIPT_URL}?action=getUserProfile&email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(sessionToken)}`,
    )
    const data = await response.json()

    console.log("User profile response:", data)

    if (data.status === "success") {
      localStorage.setItem("userData", JSON.stringify(data.userData))
      return data.userData
    } else {
      console.error("Error fetching profile:", data.message)
      return null
    }
  } catch (error) {
    console.error("Profile fetch error:", error)
    return null
  }
}

// Force refresh user data from server
async function refreshUserData() {
  // Clear the cached data first
  localStorage.removeItem("userData")
  // Then fetch fresh data
  return await fetchUserProfile(false)
}

// Debug function to get detailed user information
async function debugUserInfo() {
  const userEmail = localStorage.getItem("userEmail")

  if (!userEmail) {
    console.error("No user email found")
    return null
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=debug&email=${encodeURIComponent(userEmail)}`)
    const data = await response.json()
    console.log("Debug info:", data)
    return data
  } catch (error) {
    console.error("Debug info error:", error)
    return null
  }
}

// Get the last time user data was refreshed
function getLastRefreshTime() {
  return localStorage.getItem("lastDataRefresh") || null
}

// Set the last refresh time to now
function updateLastRefreshTime() {
  localStorage.setItem("lastDataRefresh", new Date().toISOString())
}

// Check if data needs refreshing (older than specified minutes)
function isDataStale(minutes = 5) {
  const lastRefresh = getLastRefreshTime()
  if (!lastRefresh) return true

  const lastRefreshTime = new Date(lastRefresh).getTime()
  const currentTime = new Date().getTime()
  const minutesInMs = minutes * 60 * 1000

  return currentTime - lastRefreshTime > minutesInMs
}

