// src/pages/Register.jsx

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/axios';

const Register = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
    const navigate = useNavigate();
    const password = watch('password');
    
    const onSubmit = async (data) => {
        try {
        await api.post('/registro/', data);
        toast.success('¡Registro exitoso! Por favor inicia sesión');
        navigate('/login');
        } catch (error) {
        console.error(error);
        toast.error('Error en el registro. Intenta nuevamente');
        }
    };
    
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold text-morado-800 mb-6 text-center">
            Registro
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-morado-700 mb-2">Usuario</label>
                <input
                {...register('username', { 
                    required: 'Usuario requerido',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="Elige un nombre de usuario"
                />
                {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Email</label>
                <input
                type="email"
                {...register('email', { 
                    required: 'Email requerido',
                    pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                    }
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="tu@email.com"
                />
                {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Contraseña</label>
                <input
                type="password"
                {...register('password', { 
                    required: 'Contraseña requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="Mínimo 6 caracteres"
                />
                {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Confirmar Contraseña</label>
                <input
                type="password"
                {...register('confirmPassword', { 
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden'
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500 focus:ring-2 focus:ring-morado-200"
                placeholder="Repite tu contraseña"
                />
                {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
            </div>

            <div>
                <label className="block text-morado-700 mb-2">Pregunta de Seguridad</label>
                <select
                    {...register('pregunta_seguridad', { required: 'Selecciona una pregunta' })}
                    className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                >
                    <option value="">Selecciona una pregunta</option>
                    <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                    <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                    <option value="¿Cuál es el nombre de tu mejor amigo de la infancia?">¿Cuál es el nombre de tu mejor amigo de la infancia?</option>
                    <option value="¿Cuál es tu comida favorita?">¿Cuál es tu comida favorita?</option>
                    <option value="¿Cuál es el nombre de tu escuela primaria?">¿Cuál es el nombre de tu escuela primaria?</option>
                </select>
                {errors.pregunta_seguridad && (
                    <p className="text-red-500 text-sm mt-1">{errors.pregunta_seguridad.message}</p>
                )}
                </div>

                <div>
                <label className="block text-morado-700 mb-2">Respuesta de Seguridad</label>
                <input
                    {...register('respuesta_seguridad', { required: 'Respuesta requerida' })}
                    className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                    placeholder="Tu respuesta (no distingue mayúsculas)"
                />
                {errors.respuesta_seguridad && (
                    <p className="text-red-500 text-sm mt-1">{errors.respuesta_seguridad.message}</p>
                )}
                </div>
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-morado-600 text-white py-2 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
            </form>
            
            <p className="text-center mt-4 text-morado-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-morado-800 font-semibold hover:text-morado-900">
                Inicia sesión
            </Link>
            </p>
        </div>
        </div>
    );
};

export default Register;