import {  createContext,use,useEffect,useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import React from 'react'

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false); 
            console.log('User state changed:', user);
        });

        return () => unsub();
    }, []);

    if (loading) {
        return <p>Loading...</p>; 
    }

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser,setSubmitted, submitted }}>
            {children}
        </AuthContext.Provider>
    );
};
