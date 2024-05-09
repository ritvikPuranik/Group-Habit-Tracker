import { io } from 'socket.io-client';
import { REACT_APP_API_URL } from './setupEnv';

console.log('REACT_APP_API_URL>', REACT_APP_API_URL);
export const socket = io(REACT_APP_API_URL || 'http://localhost:3000');