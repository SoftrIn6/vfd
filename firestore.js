// Import Firebase modules
import firebase from "firebase/app"
import "firebase/firestore"

// Initialize Firebase (replace with your configuration)
// const firebaseConfig = {
//   a
// };

// firebase.initializeApp(firebaseConfig);

// Get Firestore instance
const db = firebase.firestore()

// Firestore functions

// Get user profile data
async function getUserProfile(userId) {
  try {
    const doc = await db.collection("users").doc(userId).get()

    if (doc.exists) {
      return {
        success: true,
        data: doc.data(),
      }
    } else {
      return {
        success: false,
        error: "User profile not found",
      }
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Update user profile
async function updateUserProfile(userId, data) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })

    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Add a transaction (deposit or withdrawal)
async function addTransaction(userId, type, amount, details = {}) {
  try {
    // Add transaction to user's transactions subcollection
    await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .add({
        type: type, // 'deposit' or 'withdrawal'
        amount: amount,
        status: "pending", // 'pending', 'completed', 'failed'
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...details,
      })

    return { success: true }
  } catch (error) {
    console.error("Error adding transaction:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get user's transactions
async function getUserTransactions(userId, limit = 10) {
  try {
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    const transactions = []
    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      data: transactions,
    }
  } catch (error) {
    console.error("Error getting transactions:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get user's referrals
async function getUserReferrals(userId) {
  try {
    const snapshot = await db.collection("users").doc(userId).collection("referrals").orderBy("joinedAt", "desc").get()

    const referrals = []
    snapshot.forEach((doc) => {
      referrals.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      data: referrals,
    }
  } catch (error) {
    console.error("Error getting referrals:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get recent withdrawals for display on homepage
async function getRecentWithdrawals(limit = 3) {
  try {
    // In a real app, you might want to use a separate collection for this
    // This is a simplified example
    const snapshot = await db
      .collectionGroup("transactions")
      .where("type", "==", "withdrawal")
      .where("status", "==", "completed")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    const withdrawals = []
    snapshot.forEach((doc) => {
      withdrawals.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      data: withdrawals,
    }
  } catch (error) {
    console.error("Error getting recent withdrawals:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

