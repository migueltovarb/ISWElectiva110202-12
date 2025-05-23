// src/pages/PaymentMethods.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Plus, Trash2, Star } from 'lucide-react';
import api from '../config/axios';
import PaymentMethodModal from '../components/PaymentMethodModal';

const PaymentMethods = () => {
    const [metodos, setMetodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    
    useEffect(() => {
        fetchMetodos();
    }, []);
    
    const fetchMetodos = async () => {
        try {
        const response = await api.get('/metodos-pago/');
        setMetodos(response.data);
        } catch (error) {
        console.error(error);
        toast.error('Error al cargar métodos de pago');
        } finally {
        setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
        try {
            await api.delete(`/metodos-pago/${id}/`);
            toast.success('Método de pago eliminado');
            fetchMetodos();
        } catch (error) {
        console.error(error);
            toast.error('Error al eliminar');
        }
        }
    };
    
    const handleSetDefault = async (id) => {
        try {
        await api.post(`/metodos-pago/${id}/set-default/`);
        toast.success('Método predeterminado actualizado');
        fetchMetodos();
        } catch (error) {
        console.error(error);
        toast.error('Error al actualizar');
        }
    };
    
    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <div
             role="status"
             className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
        </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-morado-800">Métodos de Pago</h1>
            <button
            onClick={() => {
                setEditingMethod(null);
                setShowModal(true);
            }}
            className="bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 flex items-center gap-2"
            >
            <Plus size={20} />
            Agregar Método
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metodos.map((metodo) => (
            <div key={metodo.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <CreditCard className="text-morado-600" size={32} />
                    <div>
                    <h3 className="font-semibold">{metodo.tipo_display}</h3>
                    <p className="text-gray-600">****{metodo.numero_tarjeta}</p>
                    </div>
                </div>
                {metodo.es_predeterminado && (
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                )}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                <p>Titular: {metodo.nombre_titular}</p>
                {metodo.fecha_expiracion && (
                    <p>Expira: {metodo.fecha_expiracion}</p>
                )}
                </div>
                
                <div className="flex justify-end gap-2">
                {!metodo.es_predeterminado && (
                    <button
                    onClick={() => handleSetDefault(metodo.id)}
                    className="text-morado-600 hover:text-morado-800"
                    >
                    Hacer predeterminado
                    </button>
                )}
                <button
                    onClick={() => handleDelete(metodo.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Eliminar método ${metodo.id}`}
                >
                    <Trash2 size={20} />
                </button>
                </div>
            </div>
            ))}
        </div>
        
        {showModal && (
            <PaymentMethodModal
            method={editingMethod}
            onClose={() => setShowModal(false)}
            onSave={() => {
                setShowModal(false);
                fetchMetodos();
            }}
            />
        )}
        </div>
    );
};

export default PaymentMethods;