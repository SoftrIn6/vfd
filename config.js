// Configuration file for the application
const CONFIG = {
  // Replace with your deployed Google Apps Script Web App URL
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz-Cf81Deipb5gfpgUZHZpPUDnLppyKgtkCIztkqSI7qdYXeq_dgC6NfUNfkxmX9u8juA/exec",

  // Set to true if running within Google Apps Script environment, false if hosted elsewhere
  IS_GOOGLE_ENVIRONMENT: false,
}

// Function to make API calls to the Google Apps Script
async function callScriptAPI(action, params = {}) {
  // Add the action to the parameters
  const queryParams = { ...params, action }

  // Build the URL with query parameters
  const url = new URL(CONFIG.SCRIPT_URL)
  Object.keys(queryParams).forEach((key) => {
    url.searchParams.append(key, queryParams[key])
  })

  try {
    // Make the API call
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API call error:", error)
    throw error
  }
}

// Authentication functions
async function loginUser(email, password) {
  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    // Use google.script.run when in Google Apps Script environment
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).handleLogin(email, password)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    // Use API call when hosted elsewhere
    return callScriptAPI("login", { email, password })
  }
}

async function registerUser(username, email, password) {
  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .handleRegister(username, email, password)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    return callScriptAPI("register", { username, email, password })
  }
}

async function verifyUserSession(email, token) {
  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).verifySession(email, token)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    return callScriptAPI("verifySession", { email, token })
  }
}

async function logoutUser(email, token) {
  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).handleLogout(email, token)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    return callScriptAPI("logout", { email, token })
  }
}

async function getUserProfileData(email, token) {
  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getUserData(email, token)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    return callScriptAPI("getUserData", { email, token })
  }
}

async function updateUserProfileData(email, token, profileData) {
  const profileDataJson = JSON.stringify(profileData)

  if (CONFIG.IS_GOOGLE_ENVIRONMENT) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .updateUserProfile(email, token, profileDataJson)
      })
    } else {
      console.error(
        "google.script.run is not available. Ensure you are running in a Google Apps Script environment or mock the google object for testing.",
      )
      throw new Error("Google Apps Script environment not detected.")
    }
  } else {
    return callScriptAPI("updateUserProfile", {
      email,
      token,
      profileData: profileDataJson,
    })
  }
}

