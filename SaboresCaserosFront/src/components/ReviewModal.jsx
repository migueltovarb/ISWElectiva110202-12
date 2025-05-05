// src/components/ReviewModal.jsx
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import api from '../config/axios';

const ReviewModal = ({ pedido, onClose, onSave }) => {
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();
    const calificacion = watch('calificacion');
    
    const onSubmit = async (data) => {
        try {
        // Enviar reseñas para cada platillo
        for (const detalle of pedido.detalles) {
            const reviewData = {
            platillo: detalle.platillo,
            calificacion: data.calificacion,
            comentario: data.comentario
            };
            await api.post('/resenas/', reviewData);
        }
        
        toast.success('Reseña enviada exitosamente');
        onSave();
        } catch (error) {
        toast.error('Error al enviar reseña');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-morado-800 mb-4">
            Califica tu pedido
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-morado-700 mb-2">Calificación</label>
                <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((valor) => (
                    <button
                    key={valor}
                    type="button"
                    onClick={() => setValue('calificacion', valor)}
                    className="focus:outline-none"
                    >
                    <Star
                        size={32}
                        className={`${
                        valor <= (calificacion || 0)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        } hover:text-yellow-500 hover:fill-yellow-500 transition-colors`}
                    />
                    </button>
                ))}
                </div>
                <input
                type="hidden"
                {...register('calificacion', { required: 'Calificación requerida' })}
                />
                {errors.calificacion && (
                <p className="text-red-500 text-sm mt-1">{errors.calificacion.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-morado-700 mb-2">Comentario</label>
                <textarea
                {...register('comentario', { required: 'Comentario requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                rows="4"
                placeholder="Cuéntanos tu experiencia"
                />
                {errors.comentario && (
                <p className="text-red-500 text-sm mt-1">{errors.comentario.message}</p>
                )}
            </div>
            
            <div className="flex justify-end gap-4">
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
                {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default ReviewModal;