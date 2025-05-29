import './App.css';
import React from 'react';
import './index.css';
import Login from './login';
import { AuthContextProvider } from './context/AuthContext';

function App() {
  return (
    <AuthContextProvider>
      <div className="App w-full h-screen flex justify-center items-center">
        <Login/>
      </div>
    </AuthContextProvider>
  );
}

export default App;
