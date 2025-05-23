// src/pages/OrderHistory.test.jsx

import { vi, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderHistory from './OrderHistory';
import api from '../config/axios';

// ✅ Mock de react-hot-toast sin variable externa
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// ✅ Mock de axios
vi.mock('../config/axios');

describe('OrderHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje cuando no hay pedidos', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <OrderHistory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No tienes pedidos aún')).toBeInTheDocument();
    });
  });

  it('renderiza tabla de pedidos con datos', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          fecha_pedido: '2025-05-15T18:00:00.000Z',
          total: 25000,
          estado: 'preparando',
        },
      ],
    });

    render(
      <MemoryRouter>
        <OrderHistory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('En Preparación')).toBeInTheDocument();
      expect(screen.getByText('Ver detalles')).toBeInTheDocument();
    });
  });

  it('muestra toast de error si falla la carga', async () => {
    const { toast } = await import('react-hot-toast');
    api.get.mockRejectedValue(new Error('Falla'));

    render(
      <MemoryRouter>
        <OrderHistory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar los pedidos');
    });
  });
});
