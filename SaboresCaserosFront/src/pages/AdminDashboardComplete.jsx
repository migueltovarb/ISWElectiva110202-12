// src/pages/AdminDashboardComplete.jsx

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
    DollarSign, Package, Clock, CheckCircle, XCircle, 
    TrendingUp, Users, ShoppingBag, Calendar, Download,
    ChefHat, Coffee, PlusCircle, Edit, Trash2, Eye, EyeOff,
    CreditCard, Star, MessageCircle, Building2, BarChart2, Settings
} from 'lucide-react';
import api from '../config/axios';
import { Link } from 'react-router-dom';
import PlatilloModal from '../components/PlatilloModal';

const AdminDashboardComplete = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'platillos', 'pedidos'
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    
    // Estados para datos
    const [estadisticas, setEstadisticas] = useState({
        ventasTotales: 0,
        pedidosHoy: 0,
        pedidosPendientes: 0,
        pedidosCompletados: 0,
        gananciasMes: 0,
        clientesActivos: 0
    });
    
    const [pedidos, setPedidos] = useState([]);
    const [platillos, setPlatillos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [resenas, setResenas] = useState([]);
    const [platillosMasVendidos, setPlatillosMasVendidos] = useState([]);
    const [rendimientoChefs, setRendimientoChefs] = useState([]);
    const [pedidosPorEstado, setPedidosPorEstado] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingPlatillo, setEditingPlatillo] = useState(null);
    const [showResenasModal, setShowResenasModal] = useState(false);
    const [selectedPedidoResenas, setSelectedPedidoResenas] = useState(null);
    
    useEffect(() => {
        fetchAllData();
    }, [dateRange]);
    
    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Obtener todos los datos necesarios
            const [pedidosRes, platillosRes, categoriasRes, usuariosRes, resenasRes] = await Promise.all([
                api.get('/pedidos/'),
                api.get('/platillos/'),
                api.get('/categorias/'),
                api.get('/usuarios/'),
                api.get('/resenas/')
            ]);
            
            const todosPedidos = pedidosRes.data;
            const todosUsuarios = usuariosRes.data;
            
            // Filtrar pedidos por rango de fecha
            const pedidosFiltrados = todosPedidos.filter(pedido => {
                const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
                return fechaPedido >= dateRange.start && fechaPedido <= dateRange.end;
            });
            
            // Calcular estadísticas
            const ventasTotales = pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.total), 0);
            const pedidosHoy = pedidosFiltrados.filter(p => 
                new Date(p.fecha_pedido).toDateString() === new Date().toDateString()
            ).length;
            const pedidosPendientes = pedidosFiltrados.filter(p => p.estado === 'pendiente').length;
            const pedidosCompletados = pedidosFiltrados.filter(p => p.estado === 'entregado').length;
            const clientesActivos = new Set(pedidosFiltrados.map(p => p.cliente)).size;
            
            // Calcular pedidos por estado
            const porEstado = pedidosFiltrados.reduce((acc, pedido) => {
                acc[pedido.estado] = (acc[pedido.estado] || 0) + 1;
                return acc;
            }, {});
            
            // Calcular platillos más vendidos
            const ventasPlatillos = {};
            pedidosFiltrados.forEach(pedido => {
                pedido.detalles?.forEach(detalle => {
                    const key = detalle.platillo_nombre;
                    if (!ventasPlatillos[key]) {
                        ventasPlatillos[key] = { cantidad: 0, total: 0 };
                    }
                    ventasPlatillos[key].cantidad += detalle.cantidad;
                    ventasPlatillos[key].total += parseFloat(detalle.subtotal);
                });
            });
            
            const topPlatillos = Object.entries(ventasPlatillos)
                .map(([nombre, datos]) => ({ nombre, ...datos }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            
            // Calcular rendimiento de chefs
            const rendimientoChefs = {};
            pedidosFiltrados.forEach(pedido => {
                pedido.detalles?.forEach(detalle => {
                    const chef = detalle.chef_nombre || 'Desconocido';
                    if (!rendimientoChefs[chef]) {
                        rendimientoChefs[chef] = { pedidos: 0, total: 0 };
                    }
                    rendimientoChefs[chef].pedidos += 1;
                    rendimientoChefs[chef].total += parseFloat(detalle.subtotal);
                });
            });
            
            const topChefs = Object.entries(rendimientoChefs)
                .map(([nombre, datos]) => ({ nombre, ...datos }))
                .sort((a, b) => b.total - a.total);
            
            // Actualizar estados
            setEstadisticas({
                ventasTotales,
                pedidosHoy,
                pedidosPendientes,
                pedidosCompletados,
                gananciasMes: ventasTotales,
                clientesActivos
            });
            
            setPedidos(pedidosFiltrados);
            setPlatillos(platillosRes.data);
            setCategorias(categoriasRes.data);
            setResenas(resenasRes.data);
            setPlatillosMasVendidos(topPlatillos);
            setRendimientoChefs(topChefs);
            setPedidosPorEstado(porEstado);
            
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este platillo?')) {
            try {
                await api.delete(`/platillos/${id}/`);
                toast.success('Platillo eliminado');
                fetchAllData();
            } catch (error) {
                toast.error('Error al eliminar');
            }
        }
    };
    
    const toggleDisponibilidad = async (platillo) => {
        try {
            await api.patch(`/platillos/${platillo.id}/`, {
                disponible: !platillo.disponible
            });
            toast.success('Disponibilidad actualizada');
            fetchAllData();
        } catch (error) {
            toast.error('Error al actualizar disponibilidad');
        }
    };
    
    const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
        try {
            await api.patch(`/pedidos/${pedidoId}/`, { estado: nuevoEstado });
            toast.success('Estado actualizado');
            fetchAllData();
        } catch (error) {
            toast.error('Error al actualizar estado');
            console.error(error);
        }
    };
    
    const verResenasPedido = (pedidoId) => {
        const resenasDelPedido = resenas.filter(resena => resena.pedido === pedidoId);
        setSelectedPedidoResenas(resenasDelPedido);
        setShowResenasModal(true);
    };
    
    const exportToCSV = () => {
        const headers = ['ID', 'Cliente', 'Fecha', 'Estado', 'Total', 'Método de Pago', 'Productos'];
        const rows = pedidos.map(pedido => [
            pedido.id,
            pedido.cliente_nombre,
            new Date(pedido.fecha_pedido).toLocaleString(),
            pedido.estado,
            pedido.total,
            getMetodoPagoText(pedido.tipo_pago),
            pedido.detalles?.map(d => `${d.platillo_nombre} x${d.cantidad}`).join('; ')
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_${dateRange.start}_${dateRange.end}.csv`;
        link.click();
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
    
    const getMetodoPagoIcon = (tipo) => {
        switch (tipo) {
            case 'efectivo':
                return <DollarSign size={16} className="text-green-600" />;
            case 'tarjeta':
                return <CreditCard size={16} className="text-blue-600" />;
            case 'transferencia':
                return <Building2 size={16} className="text-purple-600" />;
            default:
                return <DollarSign size={16} className="text-gray-600" />;
        }
    };
    
    const getMetodoPagoText = (tipo) => {
        const metodos = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia'
        };
        return metodos[tipo] || tipo;
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-morado-800">Dashboard Administrativo</h1>
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                activeTab === 'dashboard' 
                                    ? 'bg-morado-600 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <BarChart2 size={20} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('platillos')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                activeTab === 'platillos' 
                                    ? 'bg-morado-600 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <Coffee size={20} />
                            Platillos
                        </button>
                        <button
                            onClick={() => setActiveTab('pedidos')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                activeTab === 'pedidos' 
                                    ? 'bg-morado-600 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <Package size={20} />
                            Pedidos
                        </button>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="flex gap-4">
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-morado-600 text-white rounded-lg hover:bg-morado-700"
                            >
                                <Download size={20} />
                                Exportar CSV
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {activeTab === 'dashboard' && (
                <>
                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Ventas Totales</p>
                                    <p className="text-2xl font-bold text-morado-800">
                                        ${estadisticas.ventasTotales.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="text-green-500" size={40} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pedidos Hoy</p>
                                    <p className="text-2xl font-bold text-morado-800">{estadisticas.pedidosHoy}</p>
                                </div>
                                <ShoppingBag className="text-blue-500" size={40} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pendientes</p>
                                    <p className="text-2xl font-bold text-yellow-600">{estadisticas.pedidosPendientes}</p>
                                </div>
                                <Clock className="text-yellow-500" size={40} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Completados</p>
                                    <p className="text-2xl font-bold text-green-600">{estadisticas.pedidosCompletados}</p>
                                </div>
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Clientes Activos</p>
                                    <p className="text-2xl font-bold text-morado-800">{estadisticas.clientesActivos}</p>
                                </div>
                                <Users className="text-purple-500" size={40} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Ticket Promedio</p>
                                    <p className="text-2xl font-bold text-morado-800">
                                        ${pedidos.length ? (estadisticas.ventasTotales / pedidos.length).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <TrendingUp className="text-indigo-500" size={40} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Sección de reseñas recientes */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Star className="text-morado-600" />
                            Reseñas Recientes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resenas.slice(0, 6).map((resena) => (
                                <div key={resena.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={star <= resena.calificacion ? 'text-yellow-400' : 'text-gray-300'}
                                                    fill={star <= resena.calificacion ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(resena.fecha).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{resena.comentario}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Por: {resena.cliente_nombre}</span>
                                        <Link 
                                            to={`/pedido/${resena.pedido}`}
                                            className="text-morado-600 hover:underline"
                                        >
                                            Pedido #{resena.pedido}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Gráficos y tablas secundarias */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Productos más vendidos */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Coffee className="text-morado-600" />
                                Top 5 Productos
                            </h3>
                            <div className="space-y-3">
                                {platillosMasVendidos.map((platillo, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{platillo.nombre}</p>
                                            <p className="text-sm text-gray-500">{platillo.cantidad} unidades</p>
                                        </div>
                                        <p className="font-bold text-morado-600">${platillo.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Rendimiento de chefs */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ChefHat className="text-morado-600" />
                                Rendimiento Chefs
                            </h3>
                            <div className="space-y-3">
                                {rendimientoChefs.map((chef, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{chef.nombre}</p>
                                            <p className="text-sm text-gray-500">{chef.pedidos} pedidos</p>
                                        </div>
                                        <p className="font-bold text-morado-600">${chef.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Estado de pedidos */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package className="text-morado-600" />
                                Estados de Pedidos
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(pedidosPorEstado).map(([estado, cantidad]) => (
                                    <div key={estado} className="flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(estado)}`}>
                                            {getStatusText(estado)}
                                        </span>
                                        <span className="font-bold">{cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {activeTab === 'platillos' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => {
                                setEditingPlatillo(null);
                                setShowModal(true);
                            }}
                            className="bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 flex items-center gap-2"
                        >
                            <PlusCircle size={20} />
                            Nuevo Platillo
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-morado-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Imagen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Chef
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Disponible
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-morado-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {platillos.map((platillo) => (
                                    <tr key={platillo.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={platillo.imagen_principal}
                                                alt={platillo.nombre}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{platillo.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{platillo.categoria_nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">${platillo.precio}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{platillo.chef_nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleDisponibilidad(platillo)}
                                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                                                    platillo.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {platillo.disponible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {platillo.disponible ? 'Disponible' : 'No disponible'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingPlatillo(platillo);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-morado-600 hover:text-morado-900"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(platillo.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            
            {activeTab === 'pedidos' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Detalle de Pedidos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método de Pago</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reseñas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pedidos.map((pedido) => {
                                    const resenasPedido = resenas.filter(r => r.pedido === pedido.id);
                                    return (
                                        <tr key={pedido.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/pedido/${pedido.id}`} className="text-morado-600 hover:underline">
                                                    #{pedido.id}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{pedido.cliente_nombre}</p>
                                                    <p className="text-sm text-gray-500">{pedido.cliente_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(pedido.fecha_pedido).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    {pedido.detalles?.map((detalle, idx) => (
                                                        <div key={idx} className="text-sm">
                                                            {detalle.platillo_nombre} x{detalle.cantidad}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={pedido.estado}
                                                    onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(pedido.estado)}`}
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="confirmado">Confirmado</option>
                                                    <option value="preparando">En Preparación</option>
                                                    <option value="listo">Listo para Entrega</option>
                                                    <option value="entregado">Entregado</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getMetodoPagoIcon(pedido.tipo_pago)}
                                                    <span>{getMetodoPagoText(pedido.tipo_pago)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                                ${pedido.total}
                                            </td>
                                            <td className="px-6 py-4">
                                                {resenasPedido.length > 0 ? (
                                                    <button
                                                        onClick={() => verResenasPedido(pedido.id)}
                                                        className="flex items-center gap-1 text-morado-600 hover:text-morado-800"
                                                    >
                                                        <Star size={16} className="text-yellow-400" fill="currentColor" />
                                                        <span>Ver ({resenasPedido.length})</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">Sin reseñas</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate" title={pedido.direccion_entrega}>
                                                    {pedido.direccion_entrega}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate" title={pedido.notas}>
                                                    {pedido.notas || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Modal de platillos */}
            {showModal && (
                <PlatilloModal
                    platillo={editingPlatillo}
                    categorias={categorias}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchAllData();
                    }}
                />
            )}
            
            {/* Modal de reseñas */}
            {showResenasModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Reseñas del Pedido</h3>
                            <button
                                onClick={() => setShowResenasModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        {selectedPedidoResenas?.map((resena) => (
                            <div key={resena.id} className="border rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={star <= resena.calificacion ? 'text-yellow-400' : 'text-gray-300'}
                                                    fill={star <= resena.calificacion ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium">{resena.cliente_nombre}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(resena.fecha).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-2">{resena.comentario}</p>
                                {!resena.aprobada && (
                                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                                        <Clock size={14} />
                                        Pendiente de aprobación
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {selectedPedidoResenas?.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                No hay reseñas para este pedido
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardComplete;