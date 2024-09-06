import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { socket } from './socket';


function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { tokenDetails, setToken } = useAuth() as any;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // useEffect(() => {
  //   function onConnect() {
  //     console.log("client-server connected");
  //     setIsConnected(true);
  //   }
    
  //   function onDisconnect() {
  //     console.log("client-server DISCONNECTED ");
  //     setIsConnected(false);
  //   }
  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);

  //   return () => {
  //     socket.off('connect', onConnect);
  //     // socket.off('disconnect', onDisconnect);
  //   };
  // }, []);

  useEffect(() => {
    const checkIfAuthenticated = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/`, {
          method: 'GET',
          credentials: 'include', // Include credentials (cookies)
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const responseJson = await response.json();
          setIsAuthenticated(true);
          setToken(responseJson.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Set loading to false after checking
      }
    };

    checkIfAuthenticated();
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a spinner or loading component if desired
  }

  return (
    <div className="App" style={{width: '95%' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated || tokenDetails.id ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginRegister />} />
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
