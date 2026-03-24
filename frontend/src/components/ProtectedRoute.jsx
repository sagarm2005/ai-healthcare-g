
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const ProtectedRoute = ({ children, roles, allowedRoles }) => {
    const { user, loading } = useAuth(); // Use the useAuth hook
    const requiredRoles = roles || allowedRoles;

    if (loading) {
        // Optionally, render a loading spinner or component while authentication status is being determined
        return <div>Loading...</div>; // Or a dedicated LoadingSpinner component
    }

    if (!user) { // If user is null, they are not authenticated
        return <Navigate to="/login" />;
    }

    if (requiredRoles && (!user.role || !requiredRoles.some(role => role.toLowerCase() === user.role.toLowerCase()))) { // Check user's role
        return <Navigate to="/" />;
    }

    return children || <Outlet />;
};

export default ProtectedRoute;
