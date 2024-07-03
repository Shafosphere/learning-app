import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';

function getRoleFromToken() {
    const token = Cookies.get('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        console.log(decoded)
        return decoded.role;
    } catch (error) {
        console.error('Failed to decode token', error);
        return null;
    }
}

function PrivateRoute({ children }) {
    const role = getRoleFromToken();
    return role === 'admin' ? children : <Navigate to='/login' />;
}

export default PrivateRoute;
