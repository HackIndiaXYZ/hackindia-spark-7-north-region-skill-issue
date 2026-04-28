import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navigation: React.FC = () => {
    const location = useLocation();
    const { isLoggedIn, userName, logout } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <>
            <div className="navbar">
                <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="logo-icon">R</span>
                    ROAMLY
                </Link>
                <div className="nav-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/planner" className={`nav-link ${location.pathname === '/planner' ? 'active' : ''}`}>Planner</Link>
                    <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                    <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>Explore</Link>
                    <Link to="/community" className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}>Community</Link>
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 600, fontSize: '15px' }}>👤 {userName}</span>
                            <button className="btn-outline" onClick={logout} style={{ padding: '8px 16px' }}>Sign out</button>
                        </div>
                    ) : (
                        <button className="btn-outline" onClick={() => setIsLoginOpen(true)}>Sign in</button>
                    )}
                </div>
            </div>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Navigation;
