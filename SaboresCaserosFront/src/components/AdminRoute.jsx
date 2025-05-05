// src/components/AdminRoute.jsx

import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

const AdminRoute = ({ children }) => {
    const user = useStore((state) => state.user);
    
    if (!user || !user.is_staff) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default AdminRoute;