import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation d'authentification (à remplacer par votre logique)
    if (email === 'admin@agrosmart.com' && password === 'demo') {
      localStorage.setItem('auth', 'true');
      navigate('/dashboard');
    } else {
      alert('Identifiants invalides (admin@agrosmart.com / demo)');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <h2>AgroSmart</h2>
          <span>Portail de gestion agricole</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email professionnel</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@agrosmart.com" required />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          <button type="submit" className="login-btn">Se connecter</button>
        </form>
        <p className="login-demo">Démo : admin@agrosmart.com / demo</p>
      </div>

      <style jsx>{`
        .login-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2f0 0%, #d9e3d4 100%);
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(8px);
          padding: 2rem 2rem 2rem;
          border-radius: 2rem;
          box-shadow: 0 25px 40px -12px rgba(0,0,0,0.2);
          width: 380px;
          text-align: center;
          border: 1px solid rgba(43,126,59,0.15);
        }
        .login-logo {
          margin-bottom: 1.8rem;
        }
        .logo-box {
          width: 56px;
          height: 56px;
          background: linear-gradient(145deg, #2b7e3b, #1f5e2d);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 10px 18px -8px #2b7e3b70;
        }
        .login-card h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e3a2f;
          margin: 0;
        }
        .login-card span {
          font-size: 0.8rem;
          color: #5b7c5a;
        }
        .input-group {
          text-align: left;
          margin-bottom: 1.2rem;
        }
        .input-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2d4730;
          display: block;
          margin-bottom: 5px;
        }
        .input-group input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid #d0decb;
          background: white;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .input-group input:focus {
          outline: none;
          border-color: #2b7e3b;
          box-shadow: 0 0 0 3px rgba(43,126,59,0.2);
        }
        .login-btn {
          width: 100%;
          background: #2b7e3b;
          color: white;
          font-weight: 700;
          padding: 12px;
          border: none;
          border-radius: 30px;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 12px;
        }
        .login-btn:hover {
          background: #1f5e2d;
          transform: translateY(-2px);
        }
        .login-demo {
          font-size: 0.7rem;
          color: #7c8f7a;
          margin-top: 1.5rem;
          background: #f0f5ed;
          display: inline-block;
          padding: 5px 12px;
          border-radius: 60px;
        }
      `}</style>
    </div>
  );
};

export default Login;