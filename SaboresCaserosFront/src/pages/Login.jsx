// src/pages/Login.jsx

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import useStore from '../store/useStore';

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const setUser = useStore((state) => state.setUser);
    
    const onSubmit = async (data) => {
        try {
        const response = await api.post('/token/', data);
        localStorage.setItem('token', response.data.access);
        
        const userResponse = await api.get('/user/me/');
        setUser(userResponse.data);
        
        toast.success('¡Bienvenido!');
        navigate('/menu');
        } catch (error) {
        toast.error('Credenciales inválidas');
        }
    };
    
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold text-morado-800 mb-6 text-center">
            Iniciar Sesión
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-morado-700 mb-2">Usuario</label>
                <input
                {...register('username', { required: 'Usuario requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="Ingresa tu usuario"
                />
                {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Contraseña</label>
                <input
                type="password"
                {...register('password', { required: 'Contraseña requerida' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="Ingresa tu contraseña"
                />
                {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-morado-600 text-white py-2 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
            </form>
            
            <p className="text-center mt-4 text-morado-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-morado-800 font-semibold hover:text-morado-900">
                Regístrate aquí{' '}
            </Link>
            </p>
            <p className="text-center mt-4 text-morado-600">
            <Link to="/forgot-password" className="text-morado-800 font-semibold hover:text-morado-900">
                ¿Olvidaste tu contraseña?
            </Link>
            </p>
        </div>
        </div>
    );
};

export default Login;