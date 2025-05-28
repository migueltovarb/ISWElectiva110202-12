// src/components/PlatilloModal.jsx

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import useStore from '../store/useStore';

const PlatilloModal = ({ platillo, categorias, onClose, onSave }) => {
  const user = useStore((state) => state.user);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: platillo || {
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
      tiempo_preparacion: '',
      disponible: true,
      chef: user?.id,
    },
  });

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const response = await api.get('/usuarios/chefs/');
        setChefs(response.data);
      } catch (error) {
        console.error('Error cargando chefs:', error);
        toast.error('Error al cargar chefs');
      } finally {
        setLoading(false);
      }
    };

    fetchChefs();
  }, []);

  const onSubmit = async (data) => {
     console.log('FORM DATA ENVIADO:', data);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'imagen_principal' && data[key][0]) {
          formData.append(key, data[key][0]);
        } else if (key !== 'imagen_principal') {
          formData.append(key, data[key]);
        }
      });

      if (platillo) {
        await api.patch(`/platillos/${platillo.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Platillo actualizado');
      } else {
        await api.post('/platillos/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Platillo creado');
      }

      onSave();
    } catch (error) {
      console.error('Error completo:', error.response?.data);
      toast.error('Error al guardar');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-morado-800 mb-4">
          {platillo ? 'Editar Platillo' : 'Nuevo Platillo'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-morado-700 mb-2">Nombre</label>
            <input
              id="nombre"
              {...register('nombre', { required: 'Nombre requerido' })}
              className="w-full px-4 py-2 border border-morado-300 rounded-lg"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-morado-700 mb-2">Descripción</label>
            <textarea
              id="descripcion"
              {...register('descripcion', { required: 'Descripción requerida' })}
              className="w-full px-4 py-2 border border-morado-300 rounded-lg"
              rows="3"
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="precio" className="block text-morado-700 mb-2">Precio</label>
              <input
                id="precio"
                type="number"
                step="0.01"
                {...register('precio', { required: 'Precio requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="tiempo_preparacion" className="block text-morado-700 mb-2">Tiempo (min)</label>
              <input
                id="tiempo_preparacion"
                type="number"
                {...register('tiempo_preparacion', { required: 'Tiempo requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="chef" className="block text-morado-700 mb-2">Chef</label>
            <select
              id="chef"
              {...register('chef', { required: 'Chef requerido' })}
              className="w-full px-4 py-2 border border-morado-300 rounded-lg"
            >
              <option value="">Selecciona un chef</option>
              {chefs.map((chef) => (
                <option key={chef.id} value={chef.id}>
                  {chef.first_name} {chef.last_name} ({chef.username})
                </option>
              ))}
            </select>
            {errors.chef && (
              <p className="text-red-500 text-sm mt-1">{errors.chef.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="categoria" className="block text-morado-700 mb-2">Categoría</label>
            <select
              id="categoria"
              {...register('categoria', { required: 'Categoría requerida' })}
              className="w-full px-4 py-2 border border-morado-300 rounded-lg"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imagen_principal" className="block text-morado-700 mb-2">Imagen</label>
            <input
              id="imagen_principal"
              type="file"
              accept="image/*"
              {...register('imagen_principal', { required: !platillo })}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="disponible" className="flex items-center gap-2">
              <input
                id="disponible"
                type="checkbox"
                {...register('disponible')}
                className="rounded text-morado-600"
              />
              <span className="text-morado-700">Disponible</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-morado-300 rounded-lg hover:bg-morado-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-morado-600 text-white rounded-lg hover:bg-morado-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatilloModal;
