import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 p-4 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/#top" className="text-2xl font-bold flex items-center space-x-2">
                    <span className="bg-white text-indigo-600 p-1 rounded-md">AI</span>
                    <span>Healthcare</span>
                </a>

                {/* Center Links */}
                <div className="hidden md:flex items-center space-x-8 font-medium">
                    <a href="/#top" className="hover:text-indigo-200 transition-colors">Home</a>
                    <a href="/#services" className="hover:text-indigo-200 transition-colors">Services</a>
                    <a href="/#about" className="hover:text-indigo-200 transition-colors">About</a>
                    <a href="/#contact" className="hover:text-indigo-200 transition-colors">Contact</a>
                </div>

                <div className="flex items-center space-x-6">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="hidden sm:inline-block">Welcome, {user.email}</span>
                            <Link
                                to={
                                    user.role === ROLES.ADMIN || user.role === 'Admin'
                                        ? '/admin/profile'
                                        : user.role === ROLES.PATIENT || user.role === 'Patient'
                                        ? '/patient/edit-profile'
                                        : '/doctor/profile'
                                }
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
                                Login
                            </Link>
                            <Link to="/register" className="hover:text-indigo-100 transition-colors font-medium">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
