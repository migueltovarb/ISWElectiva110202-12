// src/pages/OrderDetailStatus.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Truck, Package, MessageCircle, Star, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';

const OrderStatus = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [reviewData, setReviewData] = useState({ calificacion: 5, comentario: '' });
    const [supportMessage, setSupportMessage] = useState('');
    const [resenaExistente, setResenaExistente] = useState(null);
    const [loadingResena, setLoadingResena] = useState(true);

    useEffect(() => {
        fetchPedido();
        checkIfReviewed();
    }, [id]);

    const fetchPedido = async () => {
        try {
            const response = await api.get(`/pedidos/${id}/`);
            setPedido(response.data);
        } catch (error) {
            toast.error('Error al cargar el pedido');
        } finally {
            setLoading(false);
        }
    };

    const checkIfReviewed = async () => {
        try {
            setLoadingResena(true);
            // Asegúrate de que tu API filtre correctamente por pedido
            const response = await api.get('/resenas/', {
                params: { pedido: id }
            });
            
            // Verificar si hay alguna reseña para este pedido específico
            const resenaPedido = response.data.find(resena => resena.pedido === parseInt(id));
            
            if (resenaPedido) {
                setResenaExistente(resenaPedido);
            }
        } catch (error) {
            console.error('Error al verificar reseña:', error);
        } finally {
            setLoadingResena(false);
        }
    };

    const handleSubmitReview = async () => {
        try {
            if (!reviewData.comentario.trim()) {
                toast.error('Por favor escribe un comentario');
                return;
            }
    
            const reviewPayload = {
                pedido: pedido.id,
                calificacion: reviewData.calificacion,
                comentario: reviewData.comentario.trim()
            };
    
            console.log('Enviando reseña:', reviewPayload);
            console.log('ID del pedido:', pedido.id);
    
            const response = await api.post('/resenas/', reviewPayload);
    
            toast.success('¡Reseña enviada con éxito!');
            setShowReviewForm(false);
            setResenaExistente(response.data);
            setReviewData({ calificacion: 5, comentario: '' });
            
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Datos del error:', error.response?.data);
            
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else if (error.response?.data?.non_field_errors) {
                toast.error(error.response.data.non_field_errors[0]);
            } else if (error.response?.data) {
                // Mostrar errores específicos de campos
                Object.entries(error.response.data).forEach(([field, errors]) => {
                    if (Array.isArray(errors)) {
                        errors.forEach(err => toast.error(`${field}: ${err}`));
                    } else {
                        toast.error(`${field}: ${errors}`);
                    }
                });
            } else {
                toast.error('Error al enviar la reseña');
            }
        }
    };

    const handleSubmitSupport = async () => {
        try {
            if (!supportMessage.trim()) {
                toast.error('Por favor escribe un mensaje');
                return;
            }

            await api.post('/tickets-soporte/', {
                asunto: `Consulta sobre pedido #${pedido.id}`,
                mensaje: supportMessage.trim(),
                pedido: pedido.id,
                prioridad: 'media'
            });
            
            toast.success('¡Mensaje enviado a soporte!');
            setShowSupportForm(false);
            setSupportMessage('');
        } catch (error) {
            toast.error('Error al contactar soporte');
            console.error('Error completo:', error);
        }
    };

    const handleCancelar = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
            return;
        }

        try {
            await api.patch(`/pedidos/${pedido.id}/cancelar/`);
            toast.success('Pedido cancelado con éxito');
            fetchPedido();
        } catch (error) {
            toast.error('Error al cancelar el pedido');
            console.error('Error completo:', error);
        }
    };

    const getStatusIcon = (estado) => {
        switch (estado) {
            case 'pendiente':
                return <Clock className="text-yellow-500" size={24} />;
            case 'confirmado':
                return <CheckCircle className="text-blue-500" size={24} />;
            case 'preparando':
                return <Package className="text-orange-500" size={24} />;
            case 'listo':
                return <Truck className="text-green-500" size={24} />;
            case 'entregado':
                return <CheckCircle className="text-green-600" size={24} />;
            case 'cancelado':
                return <XCircle className="text-red-500" size={24} />;
            default:
                return <Clock size={24} />;
        }
    };

    const getStatusText = (estado) => {
        const estados = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'preparando': 'En Preparación',
            'listo': 'Listo para Entrega',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return estados[estado] || estado;
    };

    const canReview = () => {
        return pedido?.estado === 'entregado' && !resenaExistente && !loadingResena;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-morado-800 mb-4">Pedido no encontrado</h2>
                <Link to="/pedidos" className="text-morado-600 hover:text-morado-800">
                    Ver todos los pedidos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-morado-800 mb-8">Pedido #{pedido.id} - Estado</h1>

            {/* Estado del pedido */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {getStatusIcon(pedido.estado)}
                        <div>
                            <h2 className="text-xl font-semibold">{getStatusText(pedido.estado)}</h2>
                            <p className="text-gray-600">Fecha del pedido: {new Date(pedido.fecha_pedido).toLocaleString()}</p>
                        </div>
                    </div>
                    {pedido.estado === 'pendiente' && (
                        <button
                            onClick={handleCancelar}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Cancelar Pedido
                        </button>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Información de entrega:</h3>
                    <p className="text-gray-600">Dirección: {pedido.direccion_entrega}</p>
                    <p className="text-gray-600">Fecha de entrega: {new Date(pedido.fecha_entrega).toLocaleString()}</p>
                    {pedido.notas && <p className="text-gray-600">Notas: {pedido.notas}</p>}
                    <p className="text-gray-600">Método de pago: {pedido.metodo_pago?.tipo || pedido.tipo_pago || 'No especificado'}</p>
                </div>
            </div>

            {/* Detalles del pedido */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Detalles del pedido</h3>
                {pedido.detalles.map((detalle) => (
                    <div key={detalle.id} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{detalle.platillo_nombre}</h3>
                                <p className="text-gray-600">{detalle.cantidad} x ${detalle.precio_unitario}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${detalle.subtotal}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${pedido.total}</span>
                    </div>
                </div>
            </div>

            {/* Sección de reseña - Solo si el pedido está entregado */}
            {canReview() && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="w-full flex items-center justify-center gap-2 bg-morado-600 text-white px-4 py-3 rounded-lg hover:bg-morado-700 transition-colors"
                        >
                            <Star size={20} />
                            Dejar Reseña del Pedido
                        </button>
                    ) : (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Califica tu experiencia</h3>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewData({ ...reviewData, calificacion: star })}
                                        className={`transition-colors ${
                                            star <= reviewData.calificacion ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    >
                                        <Star size={32} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewData.comentario}
                                onChange={(e) => setReviewData({ ...reviewData, comentario: e.target.value })}
                                className="w-full border rounded-md p-3 mb-4"
                                rows="4"
                                placeholder="Cuéntanos cómo fue tu experiencia con este pedido..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmitReview}
                                    className="bg-morado-600 text-white px-6 py-2 rounded-lg hover:bg-morado-700 transition-colors"
                                >
                                    Enviar Reseña
                                </button>
                                <button
                                    onClick={() => setShowReviewForm(false)}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mostrar reseña existente */}
            {resenaExistente && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Tu Reseña</h3>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={20}
                                    className={star <= resenaExistente.calificacion ? 'text-yellow-400' : 'text-gray-300'}
                                    fill={star <= resenaExistente.calificacion ? 'currentColor' : 'none'}
                                />
                            ))}
                        </div>
                        <span className="text-gray-600">
                            {new Date(resenaExistente.fecha).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{resenaExistente.comentario}</p>
                    {resenaExistente.aprobada === false && (
                        <p className="text-sm text-yellow-600 mt-2">
                            Esta reseña está pendiente de aprobación
                        </p>
                    )}
                </div>
            )}

            {/* Indicador de que ya se reseñó (solo en pedidos entregados) */}
            {pedido.estado === 'entregado' && resenaExistente && !showReviewForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={20} />
                        <span>Ya has dejado una reseña para este pedido</span>
                    </div>
                </div>
            )}

            {/* Contactar Soporte */}
            <div className="mt-6">
                <button
                    onClick={() => setShowSupportForm(!showSupportForm)}
                    className="flex items-center gap-2 bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 transition-colors"
                >
                    <MessageCircle size={20} />
                    Contactar Soporte
                </button>

                {showSupportForm && (
                    <div className="mt-4 p-4 border rounded-lg bg-white">
                        <h3 className="font-semibold mb-2">Contactar Soporte</h3>
                        <textarea
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            className="w-full border rounded-md p-2 mb-2"
                            rows="3"
                            placeholder="Escribe tu mensaje..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmitSupport}
                                className="bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 flex items-center gap-2 transition-colors"
                            >
                                <Send size={16} />
                                Enviar Mensaje
                            </button>
                            <button
                                onClick={() => {
                                    setShowSupportForm(false);
                                    setSupportMessage('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStatus;