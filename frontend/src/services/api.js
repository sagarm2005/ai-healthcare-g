import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust your API base URL if necessary
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        // Check if the request explicitly wants to skip auth
        if (!config.skipAuth) {
            const token = Cookies.get('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only redirect if the request didn't explicitly skip the redirect
            if (!error.config?.skipErrorRedirect) {
                // Log out the user or clear the token
                Cookies.remove('token');
                // Use window.location.href to redirect if context is not available
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;