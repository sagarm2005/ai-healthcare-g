import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { ROLES } from '../../utils/constants';
import '../style/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Redirect based on role after successful login
            if (user.role === ROLES.Admin) {
                navigate('/admin/dashboard');
            } else if (user.role === ROLES.DOCTOR) {
                navigate('/doctor/dashboard');
            } else if (user.role === ROLES.PATIENT) {
                navigate('/patient/dashboard');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Logged in successfully!');
            // Redirection handled by useEffect
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Login</h2>
                </div>
                <div className="login-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-login"
                        >
                            Sign In
                        </button>
                    </form>
                    <div className="login-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
