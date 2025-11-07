// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPvVe9JOmSsvPJBLZOSZp2a8p2LXrW2gs",
  authDomain: "boxcricket-dfb82.firebaseapp.com",
  projectId: "boxcricket-dfb82",
  storageBucket: "boxcricket-dfb82.firebasestorage.app",
  messagingSenderId: "45810132291",
  appId: "1:45810132291:web:ad6a41d992e8e5426efbf6",
  measurementId: "G-FSM9M9QHV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);