import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email.split('@')[0] || 'Traveler');
        onClose();
    };

    return (
        <div
            className="modal show"
            onClick={onClose}
        >
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '32px', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                >
                    &times;
                </button>
                <h3 style={{ marginBottom: '28px' }}>Welcome back</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: '28px', marginBottom: '18px', boxSizing: 'border-box' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: '28px', marginBottom: '28px', boxSizing: 'border-box' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Sign In</button>
                </form>
                <p style={{ marginTop: '18px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>Demo — any credentials work</p>
            </div>
        </div>
    );
};

export default LoginModal;
