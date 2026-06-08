import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isSignUp && !isPasswordValid) {
      setError("Please fulfill all password requirements.");
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Success! Please check your email for confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address first to reset password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link has been sent to your email!");
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0d0c', fontFamily: 'system-ui, sans-serif' }}>
      <form onSubmit={handleAuth} className="modal" style={{ width: '360px', background: '#171312', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.03)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        
        <h3 style={{ color: '#f5f2ef', margin: '0 0 4px 0', textAlign: 'center', fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px' }}>
          {isSignUp ? "Create Coffee ERP Account" : "Sign In to Coffee ERP"}
        </h3>
        
        {error && (
          <div style={{ color: '#ff4d4d', fontSize: '13px', background: 'rgba(255, 77, 77, 0.06)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 77, 77, 0.12)', lineHeight: '1.4' }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{ color: '#4cd964', fontSize: '13px', background: 'rgba(76, 217, 100, 0.06)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(76, 217, 100, 0.12)', lineHeight: '1.4' }}>
            ✓ {message}
          </div>
        )}
        
        {/* Email */}
        <input 
          style={{ width: '100%', height: '46px', boxSizing: 'border-box', padding: '0 16px', background: '#1f1a18', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#f5f2ef', fontSize: '14px', outline: 'none' }}
          type="email" 
          placeholder="Your Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        
        {/* Password Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              style={{ 
                width: '100%', 
                height: '46px', 
                boxSizing: 'border-box', 
                padding: '0 48px 0 16px', 
                background: '#1f1a18', 
                border: isSignUp && isPasswordValid ? '1px solid rgba(76, 217, 100, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: '12px', 
                color: '#f5f2ef', 
                fontSize: '14px', 
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required={!isSignUp}
            />
            
            {/* Иконка переключения видимости (SVG-глаз) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                cursor: 'pointer', 
                background: 'none',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showPassword ? '#c08a5b' : '#8e8e93', 
                transition: 'color 0.2s',
                outline: 'none'
              }}
            >
              {showPassword ? (
                /* Иконка открытого глаза */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                /* Иконка закрытого глаза (перечеркнутый) */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </button>
          </div>

          {!isSignUp && (
            <span 
              onClick={handleForgotPassword}
              style={{ color: '#c08a5b', fontSize: '12px', textAlign: 'right', cursor: 'pointer', marginTop: '2px', alignSelf: 'flex-end', fontWeight: '500' }}
            >
              Forgot password?
            </span>
          )}

          {/* Интерактивный блок требований */}
          {isSignUp && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                padding: '8px 12px', 
                fontSize: '12px',
                borderRadius: '10px',
                background: isPasswordValid ? 'rgba(76, 217, 100, 0.04)' : 'transparent',
                border: isPasswordValid ? '1px solid rgba(76, 217, 100, 0.08)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                marginTop: '2px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPasswordValid ? '#4cd964' : (hasMinLength ? '#f5f2ef' : '#8e8e93'), transition: 'color 0.2s' }}>
                <span style={{ fontSize: '10px' }}>{hasMinLength ? "●" : "○"}</span>
                <span>At least 6 characters</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPasswordValid ? '#4cd964' : (hasUppercase ? '#f5f2ef' : '#8e8e93'), transition: 'color 0.2s' }}>
                <span style={{ fontSize: '10px' }}>{hasUppercase ? "●" : "○"}</span>
                <span>At least one uppercase letter (A-Z)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPasswordValid ? '#4cd964' : (hasNumber ? '#f5f2ef' : '#8e8e93'), transition: 'color 0.2s' }}>
                <span style={{ fontSize: '10px' }}>{hasNumber ? "●" : "○"}</span>
                <span>At least one number (0-9)</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="save-btn" 
          style={{ width: '100%', height: '46px', marginTop: '6px', padding: '0', borderRadius: '12px', border: 'none', background: '#c08a5b', color: '#fff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </button>

        <p 
          style={{ color: '#b8a9a0', fontSize: '13px', textAlign: 'center', margin: '6px 0 0 0', cursor: 'pointer', userSelect: 'none' }} 
          onClick={() => { 
            setIsSignUp(!isSignUp); 
            setError(""); 
            setMessage("");
            setPassword("");
            setShowPassword(false);
          }}
        >
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span style={{ color: '#c08a5b', fontWeight: '500' }}>{isSignUp ? "Log In" : "Sign Up"}</span>
        </p>

      </form>
    </div>
  );
}