// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider} from 'firebase/auth';
const firebaseConfig = {
    apiKey: "AIzaSyCC6vcMRXqYz1cd-aHPvdLiwqNN_w2DBIg",
    authDomain: "stream-io-aa194.firebaseapp.com",
    projectId: "stream-io-aa194",
    storageBucket: "stream-io-aa194.firebasestorage.app",
    messagingSenderId: "1006749636325",
    appId: "1:1006749636325:web:7f3dbfb4176b77eee3e60c",
    measurementId: "G-L0THR2W6GF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };