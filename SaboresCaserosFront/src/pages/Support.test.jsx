import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Support from './Support';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

vi.mock('../config/axios');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Support', () => {
  const mockTickets = [
    {
      id: 1,
      asunto: 'Problema con pago',
      descripcion: 'No se procesó el pago',
      fecha_creacion: new Date().toISOString(),
      estado: 'abierto',
      estado_display: 'Abierto',
      usuario: 1,
      mensajes: [
        {
          id: 1,
          mensaje: 'Mensaje del usuario',
          usuario: 1,
          usuario_nombre: 'Juan',
          fecha_envio: new Date().toISOString(),
        },
        {
          id: 2,
          mensaje: 'Respuesta del admin',
          usuario: 2,
          usuario_nombre: 'Admin',
          fecha_envio: new Date().toISOString(),
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el spinner de carga al inicio', async () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    render(<Support />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('carga y muestra los tickets', async () => {
    api.get.mockResolvedValueOnce({ data: mockTickets });
    render(<Support />);
    expect(await screen.findByText(/problema con pago/i)).toBeInTheDocument();
    expect(screen.getByText(/mensaje del usuario/i)).toBeInTheDocument();
    expect(screen.getByText(/respuesta del admin/i)).toBeInTheDocument();
  });

  it('muestra error al fallar carga de tickets', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    render(<Support />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar tickets');
    });
  });

  it('abre y cierra el formulario de ticket', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Support />);
    const toggleButton = await screen.findByRole('button', { name: /nuevo ticket/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /enviar ticket/i })).toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(screen.queryByRole('button', { name: /enviar ticket/i })).not.toBeInTheDocument();
  });

  it('envía un nuevo ticket correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({});
    api.get.mockResolvedValueOnce({ data: mockTickets });

    render(<Support />);
    fireEvent.click(await screen.findByRole('button', { name: /nuevo ticket/i }));

    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'cuenta' } });
    fireEvent.change(screen.getByLabelText(/asunto/i), { target: { value: 'Ayuda' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Necesito asistencia' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar ticket/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Ticket creado exitosamente');
    });
  });

  it('muestra error al fallar la creación de un ticket', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockRejectedValueOnce(new Error('Error'));

    render(<Support />);
    fireEvent.click(await screen.findByRole('button', { name: /nuevo ticket/i }));

    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'otro' } });
    fireEvent.change(screen.getByLabelText(/asunto/i), { target: { value: 'Error' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'No funciona' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar ticket/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al crear ticket');
    });
  });
});
