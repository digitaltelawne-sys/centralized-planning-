import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc    = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role ?? null);
            if (!userData.role) console.warn("Firestore doc has no 'role' field.");
          } else {
            console.error("No Firestore document found for UID:", firebaseUser.uid);
            setRole(null);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          if (err.code === "permission-denied") {
            console.error("Firestore permission denied. Check security rules for 'users'.");
          }
          setRole(null);
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}