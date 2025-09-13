import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useSelector } from 'react-redux';

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResetPassword from "./pages/ResetPassword"
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm"
import Activate from "./pages/Activate"
import ChangeName from "./pages/ChangeName"
import ChangeEmail from "./pages/ChangeEmail"
import VerifyEmail from "./pages/VerifyEmail"


import Settings from "./pages/Settings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { GlobalAlert } from "./components/Alert";
import LoadingOverlay from "./components/LoadingOverlay";

import { Provider } from 'react-redux';
import store from "./store";

import GoogleAuth from "./components/GoogleAuth";


function AppContent() {
  const loading = useSelector(state => state.auth.loading);
  
  return (
    <Router>
      <GlobalAlert className="mr-5"/>
      <LoadingOverlay isLoading={loading} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />
        <Route path="/activate/:uid/:token" element={<Activate />} />
        <Route path="/change-name" element={<ChangeName />} />
        <Route path="/change-email" element={<ChangeEmail />} />
        <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />

        <Route path="/google" element={<GoogleAuth />} />

        <Route path="/settings" element={<Settings/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <GoogleOAuthProvider 
      clientId={import.meta.env.CLIENT_ID}
    >
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;