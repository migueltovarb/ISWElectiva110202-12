// src/pages/Home.jsx

import { Link } from 'react-router-dom';
import { ChefHat, Truck, Clock } from 'lucide-react';

const Home = () => {
    return (
        <div className="w-full -mx-4 px-4">
        {/* Hero Section */}
        <section className="bg-morado-700 text-white py-20 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-4">Sabores Caseros</h1>
                    <p className="text-xl mb-8">Descubre el sabor de la comida hecha en casa</p>
                    <Link
                        to="/menu"
                        className="bg-white text-morado-700 px-8 py-3 rounded-lg font-semibold hover:bg-morado-100 transition-colors"
                    >
                        Ver Menú
                    </Link>
                </div>
            </div>
        </section>
        
        {/* Features */}
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <ChefHat className="w-12 h-12 text-morado-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chefs Expertos</h3>
            <p className="text-gray-600">Comida preparada por los mejores cocineros caseros</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Truck className="w-12 h-12 text-morado-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
            <p className="text-gray-600">Recibe tu pedido caliente y fresco en tu puerta</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Clock className="w-12 h-12 text-morado-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Servicio 24/7</h3>
            <p className="text-gray-600">Ordena cuando quieras, siempre estamos disponibles</p>
            </div>
        </section>
        </div>
    );
};

export default Home;