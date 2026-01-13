import { createContext, useState, useEffect, useContext } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for User Login State (Auto-run on load)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Check if it's the specific Admin Email
        const isAdmin = currentUser.email === "ompatil902123@gmail.com"; // CHANGE THIS to your desired admin email
        
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || "Admin",
          photo: currentUser.photoURL,
          role: isAdmin ? "admin" : "user"
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Google Login (For Students)
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 3. Admin Login (Email/Password)
  const loginAdmin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 4. Logout
  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginAdmin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);