// api-client.js
// This file provides functions for interacting with the Google Apps Script API.

import { callScriptAPI } from "./config"

// Verify user session
export async function verifyUserSession(email, token) {
  return callScriptAPI("verifySession", { email, token })
}

// Get user profile data
export async function getUserProfileData(email, token) {
  return callScriptAPI("getUserData", { email, token })
}

