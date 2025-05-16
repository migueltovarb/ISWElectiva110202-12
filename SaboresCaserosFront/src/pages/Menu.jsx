// src/pages/Menu.jsx

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../services/api';

const Menu = () => {
    const [platillos, setPlatillos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false); // ✅ Nuevo estado para errores

    const addToCart = useStore((state) => state.addToCart);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [platillosRes, categoriasRes] = await Promise.all([
                    api.get('/platillos/'),
                    api.get('/categorias/')
                ]);
                console.log('Platillos recibidos:', platillosRes.data); // Debug
                setPlatillos(platillosRes.data);
                setCategorias(categoriasRes.data);
            } catch (error) {
                console.error('Error detallado:', error); // Debug
                toast.error('Error al cargar el menú');
                setError(true); // ✅ Se marca como error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPlatillos = categoriaSeleccionada
        ? platillos.filter(p => p.categoria === parseInt(categoriaSeleccionada))
        : platillos;

    const handleAddToCart = (platillo) => {
        addToCart(platillo);
        toast.success('Agregado al carrito');
    };

    const handleImageError = (e, platillo) => {
        console.error('ERROR DE IMAGEN:');
        console.error('Platillo:', platillo.nombre);
        console.error('URL original:', e.target.src);
        console.error('Campo imagen_principal:', platillo.imagen_principal);

        e.target.onerror = null;
        e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(platillo.nombre)}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
            </div>
        );
    }

    // ✅ Mostrar mensaje visible si hay error
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500 text-center text-lg">
                    Error al cargar el menú
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-morado-800 mb-8">Nuestro Menú</h1>

            {/* Filtro por categorías */}
            <div className="mb-8">
                <select
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    className="px-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Grid de platillos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlatillos.map(platillo => {
                    console.log(`Platillo: ${platillo.nombre}, Imagen: ${platillo.imagen_principal}`);
                    return (
                        <div key={platillo.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <img
                                src={platillo.imagen_principal || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                                alt={platillo.nombre}
                                className="w-full h-48 object-cover"
                                onError={(e) => handleImageError(e, platillo)}
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-morado-800">{platillo.nombre}</h3>
                                <p className="text-gray-600 mt-2">{platillo.descripcion}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-2xl font-bold text-morado-600">
                                        ${platillo.precio}
                                    </span>
                                    <button
                                        onClick={() => handleAddToCart(platillo)}
                                        className="bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 transition-colors flex items-center gap-2"
                                    >
                                        <ShoppingCart size={20} />
                                        Agregar
                                    </button>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    Tiempo: {platillo.tiempo_preparacion} min
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Menu;
