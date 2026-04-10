import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);