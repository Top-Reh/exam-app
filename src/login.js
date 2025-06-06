// LoginForm.jsx
import React, { useContext, useEffect, useState } from 'react';
import {v4 as uuid} from "uuid";
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {AuthContext} from './context/AuthContext';
import auth, { db } from './firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    // const {currentUser,setCurrentUser} = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setName('');
    //     setError('');
    //     // const uidm = uuid();
    //     // // setCurrentUser(uidm);
    //     // await setDoc(doc(db, "user", name), {
    //     //     name: name.toLowerCase(),
    //     //     role: role,
    //     //     total: 0,
    //     //     id: uidm
    //     //     });
    //     try {
    //         const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //         console.log(userCredential.user)
    //         navigate(role === 'student' ? '/studentver' : '/teacherver');
    //     } catch (err) {
    //         setError('Login failed');
    //     }
    // };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, {
            displayName: name
        });
        const user = userCredential.user;
        console.log('User signed in:', user);
        setLoading(true); 
        await setDoc(doc(db, "user", email), {
            name: user.displayName.toLowerCase(),
            email: user.email,
            role: role,
            total: 0,
            id: user.uid
            });
        setLoading(false); 
        navigate(role === 'student' ? '/studentver' : '/teacherver');
    } catch (err) {
        console.error(err);
        setError(err.message || 'Login failed. Please check your credentials.');
    }
    };

    if (loading) {
        return <p>Loading...</p>; 
    }

    return (
        <form onSubmit={handleSubmit} className="login flex flex-col justify-center align-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded">
            <h2 className="text-2xl font-bold text-center">Login</h2>
            {error && <p>{error}</p>}
            <input
                type="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border p-2 rounded"
            />
            <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border p-2 rounded"
            />
            <div className="flex justify-center items-center gap-4">
                <input
                    type='radio'
                    name='role'
                    value='student'
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 rounded"
                />
                <label>Student</label>
                <input
                    type='radio'
                    name='role'
                    value='teacher'
                    checked={role === 'teacher'}
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 rounded"
                />
                <label >Teacher</label>
            </div>
            <button type="submit" className='rounded-s border p-2 bg-white'>Log In</button>
        </form>
    );
};

export default Login;

const classform = () => {

    return(
        <div className="flex flex-col justify-center items-center gap-4 w-full p-4 ">
            <button className='rounded-s border p-2 bg-blue-200 shadow-md'>
                Class1
            </button>
        </div>
    )
}