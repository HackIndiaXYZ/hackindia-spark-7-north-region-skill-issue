import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <div className="footer">
            <div>
                <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="logo-icon">R</span> ROAMLY
                </div>
                <p style={{ marginTop: '16px', color: '#64748B' }}>Plan less. Roam more.</p>
            </div>
            <div>
                <h4 style={{ marginBottom: '16px', color: '#0F172A' }}>Product</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><Link to="/planner" style={{ color: 'inherit', textDecoration: 'none' }}>Planner</Link></li>
                    <li><Link to="/explore" style={{ color: 'inherit', textDecoration: 'none' }}>Destinations</Link></li>
                    <li><Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link></li>
                </ul>
            </div>
            <div>
                <h4 style={{ marginBottom: '16px', color: '#0F172A' }}>Company</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
                    <li><Link to="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link></li>
                    <li><Link to="/careers" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</Link></li>
                </ul>
            </div>
            <div>
                <h4 style={{ marginBottom: '16px', color: '#0F172A' }}>Support</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><Link to="/help-center" style={{ color: 'inherit', textDecoration: 'none' }}>Help Center</Link></li>
                    <li><Link to="/safety" style={{ color: 'inherit', textDecoration: 'none' }}>Safety</Link></li>
                    <li><Link to="/cancellation" style={{ color: 'inherit', textDecoration: 'none' }}>Cancellation</Link></li>
                </ul>
            </div>
            <div>
                <h4 style={{ marginBottom: '16px', color: '#0F172A' }}>Connect</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Instagram</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a></li>
                </ul>
            </div>
        </div>
    );
};

export default Footer;
