// Configuration file for the application
const CONFIG = {
  // Replace with your deployed Google Apps Script Web App URL
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzvzmi4aIrH67uyMb8lRUW4ElO5-OFMUaifw5YkXyTG4jJql-iIs2-wsP2uTeM_nXwTsg/exec",

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

export { callScriptAPI }

