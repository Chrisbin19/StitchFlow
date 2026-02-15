'use client'

import { auth, db } from "@/firebase" // <--- 1. IMPORT DB
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore" // <--- 2. IMPORT DOC HELPERS
import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export default function AuthProvider(props) {
    const { children } = props
    const [currentUser, setCurrentUser] = useState(null)
    const [userData, setUserData] = useState(null) // <--- 3. NEW STATE FOR DB DATA
    const [isLoadingUser, setIsLoadingUser] = useState(true)

    // SIGNUP (unchanged for now, usually you create a user doc here too)
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    // 4. MODIFIED LOGIN FUNCTION
    async function login(email, password) {
        try {
            // A. Login to Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // B. Fetch Role & Details from Database
            const userDocRef = doc(db, 'users', user.uid)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) {
                const dbData = userDocSnap.data()
                
                // C. FORCE UPDATE LOCAL STORAGE
                localStorage.setItem('stitch_user_id', user.uid)
                localStorage.setItem('stitch_user_role', dbData.role || 'staff')
                localStorage.setItem('stitch_user_name', dbData.name || 'User')
                
                // D. Update State
                setUserData(dbData)
                return { success: true, role: dbData.role } // Return role for redirecting
            } else {
                return { success: false, error: "User profile missing in database" }
            }
        } catch (error) {
            console.error("Login Failed:", error)
            throw error // Throw so the UI can show the error message
        }
    }

    // 5. MODIFIED LOGOUT FUNCTION
    function logout() {
        // Clear everything so the next user doesn't see old data
        localStorage.removeItem('stitch_user_id')
        localStorage.removeItem('stitch_user_role')
        localStorage.removeItem('stitch_user_name')
        setCurrentUser(null)
        setUserData(null)
        return signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Authenticating user...')
            setIsLoadingUser(true)
            try {
                setCurrentUser(user)

                if (!user) {
                    // No user logged in, clear data
                    setUserData(null)
                    return
                }

                console.log('Found user, fetching database profile...')
                
                // 6. PERSISTENCE: Fetch DB data again if page refreshes
                const userDocRef = doc(db, 'users', user.uid)
                const userDocSnap = await getDoc(userDocRef)
                
                if (userDocSnap.exists()) {
                    const dbData = userDocSnap.data()
                    setUserData(dbData)
                    // Sync Local Storage just in case
                    localStorage.setItem('stitch_user_id', user.uid)
                    localStorage.setItem('stitch_user_role', dbData.role)
                }

            } catch (err) {
                console.log(err.message)
            } finally {
                setIsLoadingUser(false)
            }
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        userData, // Expose the DB data (Role, Name) to the app
        isLoadingUser,
        signup,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}