import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    userName: string;
    login: (name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    userName: '',
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('roamly_user');
        if (stored) {
            setUserName(stored);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (name: string) => {
        localStorage.setItem('roamly_user', name);
        setUserName(name);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('roamly_user');
        setUserName('');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
