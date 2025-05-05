// src/pages/Cart.jsx

import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import useStore from '../store/useStore';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useStore();
    
    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };
    
    const handleRemove = (id) => {
        removeFromCart(id);
        toast.success('Producto eliminado del carrito');
    };
    
    if (cart.length === 0) {
        return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-morado-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">Agrega algunos platillos deliciosos</p>
            <Link
            to="/menu"
            className="bg-morado-600 text-white px-6 py-3 rounded-lg hover:bg-morado-700 transition-colors"
            >
            Ir al Menú
            </Link>
        </div>
        );
    }
    
    return (
        <div>
        <h1 className="text-3xl font-bold text-morado-800 mb-8">Tu Carrito</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
            {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-4">
                <div className="flex items-center gap-4">
                <img
                    src={item.imagen_principal}
                    alt={item.nombre}
                    className="w-20 h-20 object-cover rounded"
                />
                <div>
                    <h3 className="font-semibold text-morado-800">{item.nombre}</h3>
                    <p className="text-morado-600">${item.precio}</p>
                </div>
                </div>
                
                <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                    onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                    className="p-1 bg-morado-100 rounded hover:bg-morado-200"
                    >
                    <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <button
                    onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                    className="p-1 bg-morado-100 rounded hover:bg-morado-200"
                    >
                    <Plus size={16} />
                    </button>
                </div>
                
                <span className="font-semibold text-morado-800 w-24 text-right">
                    ${(item.precio * item.cantidad).toFixed(2)}
                </span>
                
                <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 size={20} />
                </button>
                </div>
            </div>
            ))}
            
            <div className="mt-6 flex justify-between items-center">
            <Link
                to="/menu"
                className="text-morado-600 hover:text-morado-800"
            >
                ← Continuar comprando
            </Link>
            
            <div className="text-right">
                <p className="text-2xl font-bold text-morado-800">
                Total: ${getCartTotal().toFixed(2)}
                </p>
                <Link
                    to="/checkout"
                    className="mt-4 inline-block bg-morado-600 text-white px-6 py-3 rounded-lg hover:bg-morado-700 transition-colors"
                >
                    Proceder al pago
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
};

export default Cart;