// Import React hooks and navigation
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import component-specific styles

// Import Vanta and Three.js
import * as THREE from 'three';
import GLOBE from 'vanta/dist/vanta.globe.min';

function LoginPage() {
  // Hook for programmatic navigation to other pages
  const navigate = useNavigate();
  
  // Ref for the Vanta background element
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  
  // STATE MANAGEMENT - All form data and UI states
  const [username, setUsername] = useState('');        // Username input field value
  const [password, setPassword] = useState('');        // Password input field value
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility (eye icon)
  const [loading, setLoading] = useState(false);       // Loading state during login process
  const [error, setError] = useState('');              // Error message display

  // Initialize Vanta Globe effect
  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = GLOBE({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 100.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x75b4b8, // Cyan color to match your theme
        size: 1.40,
        backgroundColor: 0x10101f // Black background
      });
      
      // Wait for the globe to initialize, then flip it
      setTimeout(() => {
        if (vantaEffect.current && vantaEffect.current.scene) {
          // Find the globe mesh and flip it
          vantaEffect.current.scene.traverse((child) => {
            if (child.isMesh) {
              child.rotation.y = Math.PI; // 180 degree rotation on Y-axis
              child.scale.x = -1; // Alternative method: mirror the X scale
            }
          });
        }
      }, 100); // Small delay to ensure initialization
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // PASSWORD VALIDATION FUNCTION
  // Checks if password meets security requirements:
  // - At least 8 characters long
  // - Contains lowercase letter (a-z)
  // - Contains uppercase letter (A-Z) 
  // - Contains at least one digit (0-9)
  // - Contains special character (non-alphanumeric)
  const passwordValid = (pw) =>
    pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);

  // LOGIN HANDLER FUNCTION
  // Validates inputs and simulates login process
  const handleLogin = () => {
    setError(''); // Clear any previous error messages
    
    // Check if both fields are filled
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Validate password strength
    if (!passwordValid(password)) {
      setError(
        'Password must be at least 8 characters and include a digit, a-z, A-Z, and a special character'
      );
      return;
    }
    
    // Start loading animation
    setLoading(true);
    
    // Simulate API call with 1.2 second delay, then navigate to dashboard
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  // KEYBOARD EVENT HANDLER
  // Allows users to press Enter key to submit login form
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  // MAIN COMPONENT RENDER
  return (
    // MAIN BACKGROUND CONTAINER - Full screen with gradient
    <div className="login-page">
      {/* VANTA GLOBE BACKGROUND */}
      <div ref={vantaRef} className="vanta-background"></div>
      
      {/* APP TITLE - Top left corner with glowing cyan effect */}
      <div className="login-heading">VSpace-A vilagge planner</div>
      
      {/* LOGIN FORM CONTAINER - Center-right positioned glass morphism card */}
      <div className="login-container">
        {/* Form title */}
        <h2 className="login-title">Sign In</h2>
        
        {/* USERNAME INPUT FIELD */}
        <div className="login-input-block">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)} // Update username state on input
            className="login-input"
            onKeyDown={handleKeyDown} // Allow Enter key to submit
            autoFocus // Automatically focus this field when page loads
          />
        </div>
        
        {/* PASSWORD INPUT FIELD WITH VISIBILITY TOGGLE */}
        <div className="login-input-block">
          {/* Relative positioning container for password field and eye button */}
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle between text/password type
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)} // Update password state
              className="login-input password-input"
              onKeyDown={handleKeyDown} // Allow Enter key to submit
            />
            {/* EYE ICON BUTTON - Toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)} // Toggle showPassword state
              className="eye-button"
              tabIndex={-1} // Remove from tab navigation
            >
              {showPassword ? '🙈' : '👁️'} {/* Show different emoji based on state */}
            </button>
          </div>
        </div>
        
        {/* ERROR MESSAGE DISPLAY - Only shows when error state has content */}
        {error && <div className="login-error">{error}</div>}
        
        {/* LOGIN SUBMIT BUTTON */}
        <button
          onClick={handleLogin} // Trigger login process
          className="login-button"
          disabled={loading} // Disable button during loading
        >
          {/* CONDITIONAL CONTENT - Show spinner during loading, "Login" text otherwise */}
          {loading ? <span className="login-spinner"></span> : 'Login'}
        </button>
      </div>
    </div>
  );
}


export default LoginPage;
