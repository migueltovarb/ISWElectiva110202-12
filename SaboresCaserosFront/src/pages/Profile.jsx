// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import api from '../config/axios';
import useStore from '../store/useStore';

const Profile = () => {
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/me/');
                reset(response.data);
                // Si la foto viene del servidor, asegúrate de usar la URL completa
                if (response.data.foto_perfil) {
                    setPreviewImage(`http://localhost:8000${response.data.foto_perfil}`);
                }
                setLoading(false);
            } catch (error) {
                toast.error('Error al cargar perfil');
                console.error('Error:', error);
            }
        };
        
        fetchProfile();
    }, [reset]);
    
    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            // Debug: mostrar todos los datos del formulario
            console.log('Datos del formulario:', data);
            console.log('Archivo seleccionado:', selectedFile);
            
            // Agregar todos los campos excepto foto_perfil
            Object.keys(data).forEach(key => {
                if (key !== 'foto_perfil' && data[key] !== undefined && data[key] !== null) {
                    console.log(`Agregando ${key}:`, data[key]);
                    formData.append(key, data[key]);
                }
            });
            
            // Manejar la foto de perfil usando selectedFile
            if (selectedFile) {
                console.log('Agregando foto de perfil:', selectedFile);
                formData.append('foto_perfil', selectedFile);
            }
            
            // Debug: ver qué estamos enviando
            console.log('Enviando datos:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            
            const response = await api.patch('/user/me/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Respuesta:', response.data);
            
            // Actualizar el estado global con la respuesta
            if (response.data) {
                // Si la respuesta incluye una foto de perfil, asegúrate de usar la URL completa
                const updatedUser = {
                    ...response.data,
                    foto_perfil: response.data.foto_perfil ? `http://localhost:8000${response.data.foto_perfil}` : null
                };
                setUser(updatedUser);
                
                // Actualizar la vista previa de la imagen
                if (response.data.foto_perfil) {
                    setPreviewImage(`http://localhost:8000${response.data.foto_perfil}`);
                }
            }
            
            toast.success('Perfil actualizado');
            
        } catch (error) {
            console.error('Error completo:', error);
            if (error.response) {
                toast.error(`Error: ${error.response.data?.detail || 'Error del servidor'}`);
            } else {
                toast.error('Error al enviar la solicitud');
            }
        }
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Verificar el tamaño del archivo (ejemplo: máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 5MB');
                return;
            }
            
            // Verificar el tipo de archivo
            if (!file.type.startsWith('image/')) {
                toast.error('El archivo debe ser una imagen');
                return;
            }
            
            // Guardar el archivo seleccionado
            setSelectedFile(file);
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-morado-800 mb-8">Mi Perfil</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                                {previewImage ? (
                                    <img 
                                        src={previewImage} 
                                        alt="Perfil" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Error cargando imagen:', e);
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={48} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-morado-600 p-2 rounded-full cursor-pointer hover:bg-morado-700">
                                <Camera size={20} className="text-white" />
                                <input
                                    type="file"
                                    id="foto_perfil"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-morado-700 mb-2">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    {...register('first_name')}
                                    className="w-full pl-10 pr-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-morado-700 mb-2">Apellido</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    {...register('last_name')}
                                    className="w-full pl-10 pr-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-morado-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="email"
                                {...register('email', { required: 'Email requerido' })}
                                className="w-full pl-10 pr-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-morado-700 mb-2">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                {...register('telefono')}
                                className="w-full pl-10 pr-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                                placeholder="Tu teléfono"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-morado-700 mb-2">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                            <textarea
                                {...register('direccion')}
                                className="w-full pl-10 pr-4 py-2 border border-morado-300 rounded-lg focus:outline-none focus:border-morado-500"
                                placeholder="Tu dirección"
                                rows="3"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-morado-600 text-white py-3 rounded-lg hover:bg-morado-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;