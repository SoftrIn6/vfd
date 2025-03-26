// Google Apps Script for handling authentication and user data

// Spreadsheet IDs
const USER_SHEET_ID = "1Kkytc9alZfXakxP-P2PVTyliq8VOfp1ZKqjWD4hKBSs"; // Replace with your actual spreadsheet ID
const USER_SHEET_NAME = "Users";
const SESSION_SHEET_NAME = "Sessions";
const USER_PROFILE_SHEET_NAME = "UserProfiles";

// Main function to handle web app requests
function doGet(e) {
  const action = e.parameter.action;
  
  if (!action) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Missing action parameter"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  switch (action) {
    case "register":
      return handleRegister(e.parameter.username, e.parameter.email, e.parameter.password);
    case "login":
      return handleLogin(e.parameter.email, e.parameter.password);
    case "verifySession":
      return verifySession(e.parameter.email, e.parameter.token);
    case "logout":
      return handleLogout(e.parameter.email, e.parameter.token);
    case "getUserProfile":
      return getUserProfile(e.parameter.email, e.parameter.token);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid action"
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle user registration
function handleRegister(username, email, password) {
  if (!username || !email || !password) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Missing required fields"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const userSheet = ss.getSheetByName(USER_SHEET_NAME);
  
  // Check if user already exists
  const users = userSheet.getDataRange().getValues();
  for (let i = 1; i < users.length; i++) {
    if (users[i][1] === email) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "User with this email already exists"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Add new user
  userSheet.appendRow([username, email, password, new Date()]);
  
  // Create user profile
  createUserProfile(email, username);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Registration successful"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle user login
function handleLogin(email, password) {
  if (!email || !password) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Email and password are required"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const userSheet = ss.getSheetByName(USER_SHEET_NAME);
  
  // Find user
  const users = userSheet.getDataRange().getValues();
  for (let i = 1; i < users.length; i++) {
    if (users[i][1] === email && users[i][2] === password) {
      // Generate session token
      const sessionToken = generateSessionToken();
      
      // Store session
      storeSession(email, sessionToken);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Login successful",
        sessionToken: sessionToken,
        username: users[i][0]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Invalid email or password"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Generate a random session token
function generateSessionToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Store session in Sessions sheet
function storeSession(email, token) {
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  let sessionSheet = ss.getSheetByName(SESSION_SHEET_NAME);
  
  // Create Sessions sheet if it doesn't exist
  if (!sessionSheet) {
    sessionSheet = ss.insertSheet(SESSION_SHEET_NAME);
    sessionSheet.appendRow(["Email", "Token", "Created", "Expires"]);
  }
  
  // Remove any existing sessions for this user
  const sessions = sessionSheet.getDataRange().getValues();
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][0] === email) {
      sessionSheet.deleteRow(i + 1);
      break;
    }
  }
  
  // Calculate expiration (24 hours from now)
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  // Add new session
  sessionSheet.appendRow([email, token, now, expires]);
}

// Verify session token
function verifySession(email, token) {
  if (!email || !token) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Email and token are required"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const sessionSheet = ss.getSheetByName(SESSION_SHEET_NAME);
  
  if (!sessionSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "No active sessions"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Find session
  const sessions = sessionSheet.getDataRange().getValues();
  const now = new Date();
  
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][0] === email && sessions[i][1] === token) {
      const expires = new Date(sessions[i][3]);
      
      if (now > expires) {
        // Session expired
        sessionSheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Session expired"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Session valid"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Invalid session"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle user logout
function handleLogout(email, token) {
  if (!email || !token) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Email and token are required"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const sessionSheet = ss.getSheetByName(SESSION_SHEET_NAME);
  
  if (!sessionSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "No active sessions"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Find and remove session
  const sessions = sessionSheet.getDataRange().getValues();
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][0] === email && sessions[i][1] === token) {
      sessionSheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Logged out successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Session not found"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Create user profile
function createUserProfile(email, username) {
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  let profileSheet = ss.getSheetByName(USER_PROFILE_SHEET_NAME);
  
  // Create UserProfiles sheet if it doesn't exist
  if (!profileSheet) {
    profileSheet = ss.insertSheet(USER_PROFILE_SHEET_NAME);
    profileSheet.appendRow([
      "Email", 
      "Username", 
      "TotalAssets", 
      "QuantitativeAccount", 
      "SmartAccount", 
      "ProfitAssets", 
      "TotalRevenue", 
      "YesterdayEarnings", 
      "TodayEarnings", 
      "Commission"
    ]);
  }
  
  // Add default profile
  profileSheet.appendRow([
    email,
    username,
    "0.00",  // TotalAssets
    "0.00",  // QuantitativeAccount
    "0.00",  // SmartAccount
    "0.00",  // ProfitAssets
    "0.00",  // TotalRevenue
    "0.00",  // YesterdayEarnings
    "0.00",  // TodayEarnings
    "0.00"   // Commission
  ]);
}

// Get user profile data
function getUserProfile(email, token) {
  // First verify the session
  const sessionResponse = verifySession(email, token);
  const sessionData = JSON.parse(sessionResponse.getContent());
  
  if (sessionData.status !== "success") {
    return sessionResponse;
  }
  
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const profileSheet = ss.getSheetByName(USER_PROFILE_SHEET_NAME);
  
  if (!profileSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "User profile not found"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Find user profile
  const profiles = profileSheet.getDataRange().getValues();
  for (let i = 1; i < profiles.length; i++) {
    if (profiles[i][0] === email) {
      // Return user profile data
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        userData: {
          email: profiles[i][0],
          username: profiles[i][1],
          totalAssets: profiles[i][2],
          quantitativeAccount: profiles[i][3],
          smartAccount: profiles[i][4],
          profitAssets: profiles[i][5],
          totalRevenue: profiles[i][6],
          yesterdayEarnings: profiles[i][7],
          todayEarnings: profiles[i][8],
          commission: profiles[i][9]
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "User profile not found"
  })).setMimeType(ContentService.MimeType.JSON);
}

