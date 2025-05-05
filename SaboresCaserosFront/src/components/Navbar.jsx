// src/components/Navbar.jsx

import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, 
        Home, Settings, Package, 
        PieChart, UserCircle } from 'lucide-react'; 
import useStore from '../store/useStore';

const Navbar = () => {
    const { user, cart, logout } = useStore();
    
    return (
        <nav className="bg-morado-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-morado-200 hover:text-morado-100">
                        Sabores Caseros
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <Link to="/" className="hover:text-morado-300 flex items-center gap-2">
                            <Home size={20} />
                            <span className="hidden sm:inline">Inicio</span>
                        </Link>
                        
                        <Link to="/menu" className="hover:text-morado-300 flex items-center gap-2">
                            <Menu size={20} />
                            <span className="hidden sm:inline">Menú</span>
                        </Link>
                        
                        {user ? (
                            <>
                                <Link to="/cart" className="hover:text-morado-300 relative">
                                    <ShoppingCart size={20} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-morado-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            {cart.length}
                                        </span>
                                    )}
                                </Link>
                                
                                <Link to="/pedidos" className="hover:text-morado-300 flex items-center gap-2">
                                    <Package size={20} />
                                    <span className="hidden sm:inline">Mis Pedidos</span>
                                </Link>

                                {user.is_staff && (
                                    <>
                                        <Link to="/admin/dashboard" className="hover:text-morado-300 flex items-center gap-2">
                                            <PieChart size={20} />
                                            <span className="hidden sm:inline">Dashboard</span>
                                        </Link>
                                        
                                    </>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    {/* Foto de perfil */}
                                    {user.foto_perfil ? (
                                        <img 
                                            src={user.foto_perfil.startsWith('http') ? user.foto_perfil : `http://localhost:8000${user.foto_perfil}`} 
                                            alt="Perfil" 
                                            className="w-8 h-8 rounded-full object-cover border-2 border-morado-400"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-morado-600 flex items-center justify-center border-2 border-morado-400">
                                            <User size={16} className="text-white" />
                                        </div>
                                    )}
                                    
                                    {/* Nombre del usuario */}
                                    <span className="hidden sm:inline text-morado-200">
                                        {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                        {user.is_staff && ' (Admin)'}
                                    
                                    <Link to="/profile" className="hover:text-morado-300 flex items-center gap-2">
                                            <UserCircle size={20} />
                                            <span className="hidden sm:inline">Mi Perfil</span>
                                    </Link>
                                    </span>
                                    
                                    {/* Botón de logout */}
                                    <button onClick={logout} className="hover:text-morado-300">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="hover:text-morado-300 flex items-center gap-2">
                                <User size={20} />
                                <span className="hidden sm:inline">Ingresar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;