import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGpIvJhE5zm7ZSLKpP5jN2wypYRKpZyI0",
  authDomain: "centralized-planning.firebaseapp.com",
  projectId: "centralized-planning",
  storageBucket: "centralized-planning.appspot.com",
  messagingSenderId: "384749415764",
  appId: "1:384749415764:web:f9d0fa0c750888a9e7ecc1",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();

export default firebase;