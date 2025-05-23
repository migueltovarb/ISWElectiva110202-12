import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderStatus from './OrderStatus';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

vi.mock('../config/axios');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockPedido = {
  id: 1,
  estado: 'entregado',
  fecha_pedido: new Date().toISOString(),
  fecha_entrega: new Date().toISOString(),
  direccion_entrega: 'Calle 123',
  tipo_pago: 'efectivo',
  notas: 'Sin cebolla',
  detalles: [
    {
      id: 101,
      platillo_nombre: 'Pizza',
      cantidad: 2,
      precio_unitario: 15000,
      subtotal: 30000
    }
  ],
  total: 30000
};

const renderWithRouter = (component, id = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/pedidos/${id}`]}>
      <Routes>
        <Route path="/pedidos/:id" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('OrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner mientras carga', async () => {
    api.get.mockImplementationOnce(() => new Promise(() => {}));
    renderWithRouter(<OrderStatus />);
    expect(screen.getByText((_, el) => el.className.includes('animate-spin'))).toBeInTheDocument();
  });

  it('muestra error si falla el fetch del pedido', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'));
    renderWithRouter(<OrderStatus />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar el pedido');
    });
  });

  it('renderiza los detalles del pedido correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<OrderStatus />);
    await waitFor(() => {
      expect(screen.getByText(/pedido #1/i)).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByTestId('total-amount')).toHaveTextContent('$30000');

    });
  });

  it('permite contactar soporte', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({});
    renderWithRouter(<OrderStatus />);
    await waitFor(() => screen.getByText(/pedido #1/i));

    fireEvent.click(screen.getByText(/contactar soporte/i));
    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i);
    fireEvent.change(textarea, { target: { value: 'Necesito ayuda' } });
    fireEvent.click(screen.getByText(/enviar mensaje/i));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('¡Mensaje enviado a soporte!');
    });
  });

  it('muestra error si el mensaje de soporte está vacío', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<OrderStatus />);
    await waitFor(() => screen.getByText(/pedido #1/i));
    fireEvent.click(screen.getByText(/contactar soporte/i));
    fireEvent.click(screen.getByText(/enviar mensaje/i));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Por favor escribe un mensaje');
    });
  });

  it('muestra formulario de reseña si no existe una', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<OrderStatus />);
    await waitFor(() => screen.getByText(/dejar reseña/i));
    fireEvent.click(screen.getByText(/dejar reseña/i));
    expect(screen.getByText(/califica tu experiencia/i)).toBeInTheDocument();
  });

  it('envía reseña correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({ data: { id: 1, calificacion: 5, comentario: 'Muy bueno' } });

    renderWithRouter(<OrderStatus />);
    await waitFor(() => screen.getByText(/dejar reseña/i));
    fireEvent.click(screen.getByText(/dejar reseña/i));
    fireEvent.change(screen.getByPlaceholderText(/experiencia/i), { target: { value: 'Muy bueno' } });
    fireEvent.click(screen.getByText(/enviar reseña/i));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('¡Reseña enviada con éxito!');
    });
  });

  it('valida error si reseña está vacía', async () => {
    api.get.mockResolvedValueOnce({ data: mockPedido });
    api.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<OrderStatus />);
    await waitFor(() => screen.getByText(/dejar reseña/i));
    fireEvent.click(screen.getByText(/dejar reseña/i));
    fireEvent.change(screen.getByPlaceholderText(/experiencia/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/enviar reseña/i));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Por favor escribe un comentario');
    });
  });
});
