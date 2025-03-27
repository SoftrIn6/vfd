// Ensure Firebase is loaded
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "./firebase-config.js";

const auth = firebase.auth();
const db = firebase.firestore();

// Register User
async function registerUser(username, email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Store user details in Firestore
    await db.collection("users").doc(user.uid).set({
      username: username,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("User registered and saved:", user);
    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error.message);
    return { success: false, error: error.message };
  }
}

// Login User
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("User logged in:", userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
}

// Logout User
async function logoutUser() {
  try {
    await auth.signOut();
    console.log("User logged out");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error.message);
    return { success: false, error: error.message };
  }
}

// Monitor Auth State
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    console.log("No user is signed in");
  }
});

// Export functions
export { registerUser, loginUser, logoutUser };
