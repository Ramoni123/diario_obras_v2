    import React from 'react';
    import { Navigate, Outlet } from 'react-router-dom';
    import { useAuth } from '../../contexts/AuthContext';

    const ProtectedRoute = ({ roles }) => {
        const { isAuthenticated, user, loading, hasRole } = useAuth();

        if (loading) {
            return <p>Verificando autenticação...</p>; 
        }
        
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        
        if (roles && !hasRole(roles)) {
             return <Navigate to="/acesso-negado" replace />;
        }

        return <Outlet />;
    };

    export default ProtectedRoute;
    