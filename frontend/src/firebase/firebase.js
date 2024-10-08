// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS9VcV0AT59CfHpFWGtSjUaiC7SLAAqAY",
  authDomain: "nexta-c5360.firebaseapp.com",
  projectId: "nexta-c5360",
  storageBucket: "nexta-c5360.appspot.com",
  messagingSenderId: "965166277602",
  appId: "1:965166277602:web:1b68de8e65ac975f610fbb",
  measurementId: "G-YXSD8Y1QVE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
export const db = getFirestore(app);