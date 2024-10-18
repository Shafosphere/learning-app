import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from './api';

async function getRoleFromToken() {
    try {
        const response = await api.get("/auth/admin");
        if (response.data && response.data.success) {
            return 'admin';
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}

function PrivateRoute({ children }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            const role = await getRoleFromToken();
            setRole(role);
            setLoading(false);
        }
        fetchRole();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return role === 'admin' ? children : <Navigate to='/login' />;
}

export default PrivateRoute;