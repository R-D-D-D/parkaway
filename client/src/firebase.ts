// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTrK-iT2vD5jWXaC3ACb53tL4l8fvEBGA",
  authDomain: "parkaway-64620.firebaseapp.com",
  projectId: "parkaway-64620",
  storageBucket: "parkaway-64620.appspot.com",
  messagingSenderId: "683830161784",
  appId: "1:683830161784:web:ba5cba331d95853a49d88d",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
