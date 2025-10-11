import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fetch and log all valid credentials from the backend
    try {
      console.log(' Fetching valid credentials...');
      const credsResponse = await fetch('http://localhost:3001/api/auth/valid-credentials');
      console.log(' Credentials response status:', credsResponse.status);
      
      if (credsResponse.ok) {
        const credsData = await credsResponse.json();
        console.log(' Raw credentials data:', credsData);
        console.log('');
        console.log(' === PRICK-LESS VALID LOGIN CREDENTIALS ===');
        if (Array.isArray(credsData) && credsData.length > 0) {
          credsData.forEach((cred, idx) => {
            console.log(`LOGIN : ${idx + 1}. Email: ${cred.email} |  Password: ${cred.password}`);
          });
        } else {
          console.log('❌ No valid credentials found.');
        }
        console.log('=========================================');
        console.log('');
      } else {
        console.log('❌ Could not fetch valid credentials. Status:', credsResponse.status);
      }
    } catch (fetchCredsError) {
      console.log(' Error fetching valid credentials:', fetchCredsError);
    }
    console.log(' Current attempt:', { email: formData.email, isLogin: isLogin });

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      console.log('🚀 Making request to:', `http://localhost:3001${endpoint}`);
      console.log('📦 Payload:', payload);

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📊 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent component's login handler
        onLogin(data.user, data.token);
      } else {
        console.log('❌ Login failed:', data.error);
        console.log('💡 Try one of the valid credentials listed above!');
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('🔴 Connection error:', error);
      console.log('🔧 Check if backend server is running on http://localhost:3001');
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p>Access your Prick-Less glucose monitoring dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="toggle-button" 
              onClick={toggleMode}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>


      </div>
    </div>
  );
}

export default Login;