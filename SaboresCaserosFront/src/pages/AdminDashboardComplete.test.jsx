import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboardComplete from './AdminDashboardComplete';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn((url) => {
      switch (url) {
        case '/pedidos/':
          return Promise.resolve({ data: [
            {
              id: 1,
              cliente: 1,
              cliente_nombre: 'Juan',
              cliente_email: 'juan@email.com',
              fecha_pedido: new Date().toISOString(),
              estado: 'pendiente',
              tipo_pago: 'efectivo',
              total: 10000,
              direccion_entrega: 'Calle 123',
              notas: 'Sin cebolla',
              detalles: [
                { platillo_nombre: 'Pizza', cantidad: 2, subtotal: 10000, chef_nombre: 'Chef Juan' },
              ]
            }
          ] });
        case '/platillos/':
          return Promise.resolve({ data: [
            { id: 1, nombre: 'Pizza', precio: 10000, disponible: true, categoria_nombre: 'Comida', imagen_principal: '', chef_nombre: 'Chef Juan' }
          ] });
        case '/categorias/':
          return Promise.resolve({ data: [{ id: 1, nombre: 'Comida' }] });
        case '/usuarios/':
          return Promise.resolve({ data: [{ id: 1, nombre: 'Juan' }] });
        case '/resenas/':
          return Promise.resolve({ data: [
            {
              id: 1,
              cliente_nombre: 'Carlos',
              pedido: 1,
              calificacion: 4,
              comentario: 'Muy buena',
              fecha: new Date().toISOString(),
              aprobada: false,
            },
          ] });
        default:
          return Promise.resolve({ data: [] });
      }
    }),
    patch: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  }
}));

describe('AdminDashboardComplete', () => {
  it('renderiza correctamente las tarjetas del dashboard', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardComplete />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ventas Totales')).toBeInTheDocument();
      expect(screen.getByText('Pedidos Hoy')).toBeInTheDocument();
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
    });
  });

  it('permite cambiar a la pestaña de platillos', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardComplete />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Platillos'));
    expect(screen.getByText('Nuevo Platillo')).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de pedidos y muestra información', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardComplete />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Pedidos'));
    expect(screen.getByText('Detalle de Pedidos')).toBeInTheDocument();
  });

  it('muestra las reseñas recientes en el dashboard', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardComplete />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Reseñas Recientes')).toBeInTheDocument();
      expect(screen.getByText('Muy buena')).toBeInTheDocument();
    });
  });
});
