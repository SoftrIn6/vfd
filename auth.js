// Import necessary Firebase modules
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { getFirestore, collection, doc, setDoc, Timestamp, query, where, getDocs } from "firebase/firestore"
import { initializeApp } from "firebase/app"

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBrxOkeTvxINBSy5jpd5gi4nh51CdV9GTE",
  authDomain: "crypto-trading-platform-7c30a.firebaseapp.com",
  projectId: "crypto-trading-platform-7c30a",
  storageBucket: "crypto-trading-platform-7c30a.firebasestorage.app",
  messagingSenderId: "244486040017",
  appId: "1:244486040017:web:adb708f4e25d7e065f58f0",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const firebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => Timestamp.now(),
    },
  },
}

// Authentication functions

// Register a new user
async function registerUser(username, email, password, referralCode = null) {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Add user profile to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      accountBalance: 0,
      quantitativeAccount: 0,
      smartAccount: 0,
      totalRevenue: 0,
      yesterdayEarnings: 0,
      todayEarnings: 0,
      commission: 0,
      profitAssets: 0,
      referredBy: referralCode,
      referralCode: generateReferralCode(),
    })

    // If there's a referral code, update the referrer's data
    if (referralCode) {
      const referrersQuery = await getDocs(query(collection(db, "users"), where("referralCode", "==", referralCode)))

      if (!referrersQuery.empty) {
        const referrerId = referrersQuery.docs[0].id

        // Add this user to referrer's referrals subcollection
        await setDoc(doc(db, "users", referrerId, "referrals", user.uid), {
          email: email,
          username: username,
          joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
      }
    }

    return {
      success: true,
      user: user,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Login user
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user,
    }
  } catch (error) {
    console.error("Error logging in:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Logout user
async function logoutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error("Error logging out:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Check if user is logged in
function checkAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}

// Get current user
function getCurrentUser() {
  return auth.currentUser
}

// Generate a random 6-digit referral code
function generateReferralCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

