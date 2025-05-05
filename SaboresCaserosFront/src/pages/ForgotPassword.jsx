// src/pages/ForgotPassword.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Lock } from 'lucide-react';
import api from '../config/axios';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: username, 2: pregunta, 3: nueva contraseña
    const [pregunta, setPregunta] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const navigate = useNavigate();
    
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    
    const onSubmitUsername = async (data) => {
        try {
        const response = await api.post('/verificar-pregunta/', data);
        setPregunta(response.data.pregunta);
        setUsuarioId(response.data.usuario_id);
        setStep(2);
        reset();
        } catch (error) {
        toast.error(error.response?.data?.error || 'Error al verificar usuario');
        }
    };
    
    const onSubmitRespuesta = async (data) => {
        try {
        const response = await api.post('/recuperar-password/', {
            usuario_id: usuarioId,
            respuesta: data.respuesta,
            nueva_password: data.nueva_password
        });
        toast.success('¡Contraseña actualizada exitosamente!');
        navigate('/login');
        } catch (error) {
        toast.error(error.response?.data?.error || 'Error al actualizar contraseña');
        }
    };
    
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            {step === 1 && (
            <>
                <h2 className="text-2xl font-bold text-morado-800 mb-6 text-center">
                Recuperar Contraseña
                </h2>
                
                <form onSubmit={handleSubmit(onSubmitUsername)} className="space-y-4">
                <div>
                    <label className="block text-morado-700 mb-2">Usuario</label>
                    <input
                    {...register('username', { required: 'Usuario requerido' })}
                    className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                    placeholder="Ingresa tu usuario"
                    />
                    {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                </div>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-morado-600 text-white py-2 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Verificando...' : 'Continuar'}
                </button>
                </form>
            </>
            )}
            
            {step === 2 && (
            <>
                <div className="text-center mb-6">
                <HelpCircle className="w-12 h-12 text-morado-600 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-morado-800">
                    Pregunta de Seguridad
                </h2>
                </div>
                
                <div className="bg-morado-50 p-4 rounded-lg mb-6">
                <p className="text-morado-800 font-medium">{pregunta}</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmitRespuesta)} className="space-y-4">
                <div>
                    <label className="block text-morado-700 mb-2">Respuesta</label>
                    <input
                    {...register('respuesta', { required: 'Respuesta requerida' })}
                    className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                    placeholder="Tu respuesta"
                    />
                    {errors.respuesta && (
                    <p className="text-red-500 text-sm mt-1">{errors.respuesta.message}</p>
                    )}
                </div>
                
                <div>
                    <label className="block text-morado-700 mb-2">Nueva Contraseña</label>
                    <input
                    type="password"
                    {...register('nueva_password', { 
                        required: 'Contraseña requerida',
                        minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                    })}
                    className="w-full px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                    placeholder="Mínimo 6 caracteres"
                    />
                    {errors.nueva_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.nueva_password.message}</p>
                    )}
                </div>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-morado-600 text-white py-2 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
                </form>
            </>
            )}
            
            <p className="text-center mt-4">
            <Link to="/login" className="text-morado-600 hover:text-morado-800">
                Volver al inicio de sesión
            </Link>
            </p>
        </div>
        </div>
    );
};

export default ForgotPassword;