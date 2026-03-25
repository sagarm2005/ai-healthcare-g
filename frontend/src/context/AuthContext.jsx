import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

export const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = Cookies.get('token');
                if (token) {
                    // In a real app, you'd verify the token with the backend
                    // and fetch user details to ensure it's still valid.
                    // For now, we'll decode and assume validity.
                    // A better approach: a /api/auth/me endpoint
                    const res = await api.get('/auth/me'); // Example: get current user from token
                    setUser(res.data);
                }
            } catch (error) {
                console.error("Failed to load user from token:", error);
                Cookies.remove('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password }, { skipAuth: true });
        const { token, ...userData } = res.data;
        Cookies.set('token', token, { expires: 1 }); // expires in 1 day
        setUser(userData);
        return userData;
    };

    const register = async (userData) => {
        // userData can be a plain object or FormData
        let role;
        if (userData instanceof FormData) {
            role = userData.get('role');
        } else {
            role = userData.role;
        }

        if (!role) {
            throw new Error('Role is required for registration');
        }

        const res = await api.post('/auth/register', userData, { skipAuth: true });
        const { token, ...newUserData } = res.data;
        Cookies.set('token', token, { expires: 1 });
        setUser(newUserData);
        return newUserData;
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
