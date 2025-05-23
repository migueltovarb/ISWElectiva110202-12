import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MessageCircle, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/');
      setTickets(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/tickets/', data);
      toast.success('Ticket creado exitosamente');
      reset();
      setShowForm(false);
      fetchTickets();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear ticket');
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'abierto':
        return <Clock className="text-yellow-500" size={20} />;
      case 'en_proceso':
        return <MessageCircle className="text-blue-500" size={20} />;
      case 'resuelto':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cerrado':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-morado-600"
          role="status"
        ></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-morado-800">Soporte</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-morado-600 text-white px-4 py-2 rounded-lg hover:bg-morado-700 flex items-center gap-2"
        >
          <MessageCircle size={20} />
          {showForm ? 'Cancelar' : 'Nuevo Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="categoria" className="block text-morado-700 mb-2">Categoría</label>
              <select
                id="categoria"
                {...register('categoria', { required: 'Categoría requerida' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
              >
                <option value="">Selecciona una categoría</option>
                <option value="pedido">Problema con Pedido</option>
                <option value="pago">Problema de Pago</option>
                <option value="cuenta">Cuenta</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="asunto" className="block text-morado-700 mb-2">Asunto</label>
              <input
                id="asunto"
                {...register('asunto', { required: 'Asunto requerido' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                placeholder="Breve descripción del problema"
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-morado-700 mb-2">Descripción</label>
              <textarea
                id="descripcion"
                {...register('descripcion', { required: 'Descripción requerida' })}
                className="w-full px-4 py-2 border border-morado-300 rounded-lg"
                rows="4"
                placeholder="Describe tu problema en detalle"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-morado-600 text-white py-2 rounded-lg hover:bg-morado-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{ticket.asunto}</h3>
                <p className="text-sm text-gray-600">
                  Ticket #{ticket.id} • {new Date(ticket.fecha_creacion).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(ticket.estado)}
                <span className="text-sm">{ticket.estado_display}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{ticket.descripcion}</p>

            {ticket.mensajes && ticket.mensajes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Mensajes</h4>
                <div className="space-y-2">
                  {ticket.mensajes.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`p-3 rounded-lg ${
                        mensaje.usuario === ticket.usuario
                          ? 'bg-morado-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        {mensaje.usuario_nombre} • {new Date(mensaje.fecha_envio).toLocaleString()}
                      </p>
                      <p>{mensaje.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
