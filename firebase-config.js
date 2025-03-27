// Import the Firebase SDK
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrxOkeTvxINBSy5jpd5gi4nh51CdV9GTE",
  authDomain: "crypto-trading-platform-7c30a.firebaseapp.com",
  projectId: "crypto-trading-platform-7c30a",
  storageBucket: "crypto-trading-platform-7c30a.firebasestorage.app",
  messagingSenderId: "244486040017",
  appId: "1:244486040017:web:adb708f4e25d7e065f58f0",
}

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

// Initialize services
const auth = firebase.auth()
const db = firebase.firestore()

// Update firestore settings
db.settings({ timestampsInSnapshots: true })

