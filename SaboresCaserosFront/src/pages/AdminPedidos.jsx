// src/pages/AdminPedidos.jsx

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, User, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/axios';

const AdminPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    
    useEffect(() => {
        fetchPedidos();
    }, []);
    
    const fetchPedidos = async () => {
        try {
        const response = await api.get('/pedidos/');
        setPedidos(response.data);
        } catch (error) {
        toast.error('Error al cargar pedidos');
        } finally {
        setLoading(false);
        }
    };
    
    const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
        try {
        await api.post(`/pedidos/${pedidoId}/cambiar_estado/`, { estado: nuevoEstado });
        toast.success('Estado actualizado');
        fetchPedidos();
        } catch (error) {
        toast.error('Error al actualizar estado');
        }
    };
    
    const getStatusBadgeClass = (estado) => {
        const classes = {
        'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'confirmado': 'bg-blue-100 text-blue-800 border-blue-200',
        'preparando': 'bg-orange-100 text-orange-800 border-orange-200',
        'listo': 'bg-green-100 text-green-800 border-green-200',
        'entregado': 'bg-green-200 text-green-900 border-green-300',
        'cancelado': 'bg-red-100 text-red-800 border-red-200'
        };
        return classes[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
    };
    
    const pedidosFiltrados = filtroEstado 
        ? pedidos.filter(pedido => pedido.estado === filtroEstado)
        : pedidos;
    
    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
        </div>
        );
    }
    
    return (
        <div>
        <h1 className="text-3xl font-bold text-morado-800 mb-8">Gestión de Pedidos</h1>
        
        <div className="mb-6 flex gap-4">
            <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-morado-300 rounded-lg"
            >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="preparando">En Preparación</option>
            <option value="listo">Listo para Entrega</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
            </select>
        </div>
        
        <div className="grid gap-6">
            {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-morado-800">
                    Pedido #{pedido.id}
                    </h3>
                    <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span>{pedido.cliente_nombre}</span>
                        {pedido.cliente_email && (
                        <span className="text-gray-400">({pedido.cliente_email})</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>{new Date(pedido.fecha_pedido).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign size={16} />
                        <span className="font-semibold">${pedido.total}</span>
                    </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <select
                    value={pedido.estado}
                    onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                    className={`px-3 py-1 rounded-lg border ${getStatusBadgeClass(pedido.estado)}`}
                    >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">En Preparación</option>
                    <option value="listo">Listo para Entrega</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                    </select>
                    
                    <Link
                    to={`/pedido/${pedido.id}`}
                    className="text-morado-600 hover:text-morado-800 flex items-center gap-1"
                    >
                    <Eye size={16} />
                    Ver detalles
                    </Link>
                </div>
                </div>
                
                <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Productos:</h4>
                <ul className="list-disc list-inside">
                    {pedido.detalles?.map((detalle) => (
                    <li key={detalle.id} className="text-gray-600">
                        {detalle.platillo_nombre} x {detalle.cantidad} - ${detalle.subtotal}
                    </li>
                    ))}
                </ul>
                </div>
                
                {pedido.notas && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                    <strong>Notas:</strong> {pedido.notas}
                    </p>
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
};

export default AdminPedidos;