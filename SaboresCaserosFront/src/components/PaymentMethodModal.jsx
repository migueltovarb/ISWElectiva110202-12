// src/components/PaymentMethodModal.jsx

import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../config/axios';

const PaymentMethodModal = ({ method, onClose, onSave }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: method || {
        tipo: '',
        nombre_titular: '',
        numero_tarjeta: '',
        fecha_expiracion: '',
        es_predeterminado: false
        }
    });
    
    const onSubmit = async (data) => {
        try {
        // Solo guardar los últimos 4 dígitos de la tarjeta
        const dataToSend = {
            ...data,
            numero_tarjeta: data.numero_tarjeta.slice(-4)
        };
        
        if (method) {
            await api.patch(`/metodos-pago/${method.id}/`, dataToSend);
            toast.success('Método de pago actualizado');
        } else {
            await api.post('/metodos-pago/', dataToSend);
            toast.success('Método de pago agregado');
        }
        
        onSave();
        } catch (error) {
        toast.error('Error al guardar método de pago');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-morado-800 mb-4">
            {method ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-morado-700 mb-2">Tipo de Pago</label>
                <select
                {...register('tipo', { required: 'Tipo requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                >
                <option value="">Selecciona un tipo</option>
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
                <option value="tarjeta_debito">Tarjeta de Débito</option>
                <option value="paypal">PayPal</option>
                <option value="efectivo">Efectivo</option>
                </select>
                {errors.tipo && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Nombre del Titular</label>
                <input
                {...register('nombre_titular', { required: 'Nombre requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                placeholder="Nombre como aparece en la tarjeta"
                />
                {errors.nombre_titular && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre_titular.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Número de Tarjeta</label>
                <input
                {...register('numero_tarjeta', { 
                    required: 'Número requerido',
                    pattern: {
                    value: /^[0-9]{16}$/,
                    message: 'Debe ser un número de 16 dígitos'
                    }
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                />
                {errors.numero_tarjeta && (
                <p className="text-red-500 text-sm mt-1">{errors.numero_tarjeta.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Fecha de Expiración</label>
                <input
                {...register('fecha_expiracion', { 
                    required: 'Fecha requerida',
                    pattern: {
                    value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                    message: 'Formato MM/YY'
                    }
                })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                placeholder="MM/YY"
                maxLength="5"
                />
                {errors.fecha_expiracion && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_expiracion.message}</p>
                )}
            </div>
            
            <div>
                <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    {...register('es_predeterminado')}
                    className="rounded text-morado-600"
                />
                <span className="text-morado-700">Usar como método predeterminado</span>
                </label>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-morado-300 rounded-lg hover:bg-morado-50"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-morado-600 text-white rounded-lg hover:bg-morado-700 disabled:opacity-50"
                >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default PaymentMethodModal;