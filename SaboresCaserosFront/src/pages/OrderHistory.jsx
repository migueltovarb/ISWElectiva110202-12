// src/pages/OrderHistory.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye } from 'lucide-react';
import api from '../config/axios';

const OrderHistory = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchPedidos();
    }, []);
    
    const fetchPedidos = async () => {
        try {
        const response = await api.get('/pedidos/');
        setPedidos(response.data);
        } catch (error) {
        toast.error('Error al cargar los pedidos');
        } finally {
        setLoading(false);
        }
    };
    
    const getStatusBadgeClass = (estado) => {
        const classes = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'confirmado': 'bg-blue-100 text-blue-800',
        'preparando': 'bg-orange-100 text-orange-800',
        'listo': 'bg-green-100 text-green-800',
        'entregado': 'bg-green-200 text-green-900',
        'cancelado': 'bg-red-100 text-red-800'
        };
        return classes[estado] || 'bg-gray-100 text-gray-800';
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
    
    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
        </div>
        );
    }
    
    return (
        <div>
        <h1 className="text-3xl font-bold text-morado-800 mb-8">Mis Pedidos</h1>
        
        {pedidos.length === 0 ? (
            <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-morado-800 mb-4">No tienes pedidos aún</h2>
            <p className="text-gray-600 mb-8">¡Realiza tu primer pedido!</p>
            <Link
                to="/menu"
                className="bg-morado-600 text-white px-6 py-3 rounded-lg hover:bg-morado-700 transition-colors"
            >
                Ir al Menú
            </Link>
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-morado-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                    ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                    Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                    Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                    Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                    Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {pedidos.map((pedido) => (
                    <tr key={pedido.id}>
                    <td className="px-6 py-4 whitespace-nowrap">#{pedido.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(pedido.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${pedido.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(pedido.estado)}`}>
                        {getStatusText(pedido.estado)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                        to={`/pedido/${pedido.id}`}
                        className="text-morado-600 hover:text-morado-900 flex items-center gap-2"
                        >
                        <Eye size={18} />
                        Ver detalles
                        </Link>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
};

export default OrderHistory;