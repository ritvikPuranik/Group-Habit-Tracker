import React, {useState, useEffect} from 'react';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import { useAuth } from './AuthContext';
import { socket } from './socket';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      console.log("client-server connected");
      setIsConnected(true);
    }
    
    function onDisconnect() {
      console.log("client-server DISCONNECTED ");
      setIsConnected(false);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      // socket.off('disconnect', onDisconnect);
    };
  }, []);

  const { tokenDetails } = useAuth() as { tokenDetails: {id: number} };
  return (
    <div className="App" style={{width: '80%' }}>
      {tokenDetails.id ? <Dashboard /> : <LoginRegister />}
    </div>
  );
}

export default App;
