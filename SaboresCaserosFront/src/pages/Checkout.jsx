// src/pages/Checkout.jsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, DollarSign, Building2, Save } from 'lucide-react';
import api from '../config/axios';
import useStore from '../store/useStore';

const Checkout = () => {
    const { cart, getCartTotal, clearCart, user } = useStore();
    const navigate = useNavigate();
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [guardarMetodo, setGuardarMetodo] = useState(false);
    const [metodosPagosGuardados, setMetodosPagosGuardados] = useState([]);
    const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);
    
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        fetchMetodosPago();
        // Establecer fecha y hora de entrega automática (55 minutos después)
        const fechaEntrega = new Date();
        fechaEntrega.setMinutes(fechaEntrega.getMinutes() + 55);
        setValue('fecha_entrega', fechaEntrega.toISOString().slice(0, 16));
    }, [setValue]);

    const fetchMetodosPago = async () => {
        try {
            const response = await api.get('/metodos-pago/');
            setMetodosPagosGuardados(response.data);
        } catch (error) {
            console.error('Error al cargar métodos de pago:', error);
        }
    };

    const formatDateForBackend = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString();
    };

    const onSubmit = async (data) => {
        try {
            const pedido = {
                direccion_entrega: data.direccion,
                fecha_entrega: formatDateForBackend(data.fecha_entrega),
                total: getCartTotal(),
                notas: data.notas || '',
                tipo_pago: metodoPago,
                detalles: cart.map(item => ({
                    platillo: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: parseFloat(item.precio)
                }))
            };

            // Si se seleccionó un método guardado, agregarlo al pedido
            if (selectedSavedMethod) {
                pedido.metodo_pago_id = selectedSavedMethod;
            }

            console.log('Datos del pedido a enviar:', pedido);
            
            const response = await api.post('/pedidos/', pedido);

            // Si el usuario quiere guardar el método de pago
            if (guardarMetodo && metodoPago === 'tarjeta' && !selectedSavedMethod) {
                try {
                    await api.post('/metodos-pago/', {
                        tipo: 'tarjeta',
                        numero_tarjeta: data.numero_tarjeta.slice(-4), // Solo últimos 4 dígitos
                        nombre_titular: data.nombre_tarjeta,
                        fecha_expiracion: data.fecha_expiracion,
                        es_predeterminado: false
                    });
                    toast.success('Método de pago guardado');
                } catch (error) {
                    console.error('Error al guardar método de pago:', error);
                }
            }

            toast.success('¡Pedido realizado con éxito!');
            clearCart();
            navigate(`/pedido/${response.data.id}`);
        } catch (error) {
            console.error('Error completo:', error.response?.data);
            toast.error('Error al realizar el pedido');
        }
    };
    
    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-morado-800 mb-8">Finalizar Pedido</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-morado-700 mb-4">Resumen del Pedido</h2>
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between py-2 border-b">
                            <span>{item.nombre} x {item.cantidad}</span>
                            <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg mt-4">
                        <span>Total:</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-morado-700 mb-2">Dirección de Entrega</label>
                        <textarea
                            {...register('direccion', { required: 'Dirección requerida' })}
                            className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                            rows="3"
                            placeholder="Ingresa tu dirección completa"
                            defaultValue={user?.direccion || ''}
                        />
                        {errors.direccion && (
                            <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="fecha_entrega" className="block text-morado-700 mb-2">
                        Fecha y Hora de Entrega (Estimada: 55 minutos)
                        </label>
                        <input
                        id="fecha_entrega"
                        type="datetime-local"
                        {...register('fecha_entrega', { required: 'Fecha requerida' })}
                        className="w-full px-4 py-2 border border-morado-300 rounded-lg bg-gray-100"
                        readOnly
                        />

                        <p className="text-sm text-gray-600 mt-1">
                            Tu pedido será entregado aproximadamente a las {new Date(new Date().getTime() + 55 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    {/* Método de pago */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-morado-700 mb-4">Método de Pago</h3>
                        
                        {/* Métodos guardados */}
                        {metodosPagosGuardados.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-morado-700 mb-2">Métodos guardados</label>
                                <div className="space-y-2">
                                    {metodosPagosGuardados.map(metodo => (
                                        <label key={metodo.id} className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                name="metodo_guardado"
                                                value={metodo.id}
                                                onChange={() => {
                                                    setSelectedSavedMethod(metodo.id);
                                                    setMetodoPago('tarjeta');
                                                }}
                                                className="form-radio text-morado-600"
                                            />
                                            <span className="flex items-center gap-2">
                                                <CreditCard size={20} />
                                                •••• {metodo.numero_tarjeta}
                                                {metodo.es_predeterminado && (
                                                    <span className="text-xs bg-morado-100 text-morado-800 px-2 py-1 rounded">
                                                        Predeterminado
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="my-4 border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">O selecciona un nuevo método:</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Selector de método de pago */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <label className="relative">
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="efectivo"
                                    checked={metodoPago === 'efectivo' && !selectedSavedMethod}
                                    onChange={() => {
                                        setMetodoPago('efectivo');
                                        setSelectedSavedMethod(null);
                                    }}
                                    className="peer sr-only"
                                />
                                <div className="p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-morado-600 peer-checked:bg-morado-50">
                                    <DollarSign className="mx-auto mb-2 text-morado-600" size={24} />
                                    <p className="text-center font-medium">Efectivo</p>
                                </div>
                            </label>
                            
                            <label className="relative">
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="tarjeta"
                                    checked={metodoPago === 'tarjeta' && !selectedSavedMethod}
                                    onChange={() => {
                                        setMetodoPago('tarjeta');
                                        setSelectedSavedMethod(null);
                                    }}
                                    className="peer sr-only"
                                />
                                <div className="p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-morado-600 peer-checked:bg-morado-50">
                                    <CreditCard className="mx-auto mb-2 text-morado-600" size={24} />
                                    <p className="text-center font-medium">Tarjeta</p>
                                </div>
                            </label>
                            
                            <label className="relative">
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="transferencia"
                                    checked={metodoPago === 'transferencia' && !selectedSavedMethod}
                                    onChange={() => {
                                        setMetodoPago('transferencia');
                                        setSelectedSavedMethod(null);
                                    }}
                                    className="peer sr-only"
                                />
                                <div className="p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-morado-600 peer-checked:bg-morado-50">
                                    <Building2 className="mx-auto mb-2 text-morado-600" size={24} />
                                    <p className="text-center font-medium">Transferencia</p>
                                </div>
                            </label>
                        </div>
                        
                        {/* Campos para tarjeta */}
                        {metodoPago === 'tarjeta' && !selectedSavedMethod && (
                            <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-morado-700 mb-2">Número de Tarjeta</label>
                                    <input
                                        type="text"
                                        {...register('numero_tarjeta', {
                                            required: metodoPago === 'tarjeta' ? 'Número de tarjeta requerido' : false,
                                            pattern: {
                                                value: /^[0-9]{16}$/,
                                                message: 'Ingresa un número de tarjeta válido (16 dígitos)'
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
                                    <label className="block text-morado-700 mb-2">Nombre en la Tarjeta</label>
                                    <input
                                        type="text"
                                        {...register('nombre_tarjeta', {
                                            required: metodoPago === 'tarjeta' ? 'Nombre requerido' : false
                                        })}
                                        className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                                        placeholder="Como aparece en la tarjeta"
                                    />
                                    {errors.nombre_tarjeta && (
                                        <p className="text-red-500 text-sm mt-1">{errors.nombre_tarjeta.message}</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-morado-700 mb-2">Fecha de Expiración</label>
                                        <input
                                            type="text"
                                            {...register('fecha_expiracion', {
                                                required: metodoPago === 'tarjeta' ? 'Fecha requerida' : false,
                                                pattern: {
                                                    value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                                    message: 'Formato: MM/YY'
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
                                        <label className="block text-morado-700 mb-2">CVV</label>
                                        <input
                                            type="text"
                                            {...register('cvv', {
                                                required: metodoPago === 'tarjeta' ? 'CVV requerido' : false,
                                                pattern: {
                                                    value: /^[0-9]{3,4}$/,
                                                    message: 'CVV inválido'
                                                }
                                            })}
                                            className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                                            placeholder="123"
                                            maxLength="4"
                                        />
                                        {errors.cvv && (
                                            <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Checkbox para guardar método */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="guardar_metodo"
                                        checked={guardarMetodo}
                                        onChange={(e) => setGuardarMetodo(e.target.checked)}
                                        className="h-4 w-4 text-morado-600 focus:ring-morado-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="guardar_metodo" className="ml-2 block text-sm text-gray-900">
                                        <span className="flex items-center gap-2">
                                            <Save size={16} />
                                            Guardar este método de pago para futuras compras
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                        
                        {/* Información para transferencia */}
                        {metodoPago === 'transferencia' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-morado-700 mb-2">Información para transferencia:</h4>
                                <p className="text-sm text-gray-700">Banco: Banco Ejemplo</p>
                                <p className="text-sm text-gray-700">Cuenta: 1234567890</p>
                                <p className="text-sm text-gray-700">Titular: Sabores Caseros S.A.</p>
                                <p className="text-sm text-gray-700 mt-2">
                                    Envía el comprobante a: pagos@saborescaseros.com
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-morado-700 mb-2">Notas (opcional)</label>
                        <textarea
                            {...register('notas')}
                            className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                            rows="2"
                            placeholder="Instrucciones especiales para la entrega"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-morado-600 text-white py-3 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;