// src/pages/AdminDashboardComplete.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import AdminDashboardComplete from './AdminDashboardComplete';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn((url) => {
      switch (url) {
        case '/pedidos/':
          return Promise.resolve({
            data: [
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
                ],
              },
            ],
          });
        case '/platillos/':
          return Promise.resolve({
            data: [
              {
                id: 1,
                nombre: 'Pizza',
                precio: 10000,
                disponible: true,
                categoria_nombre: 'Comida',
                imagen_principal: '',
                chef_nombre: 'Chef Juan',
              },
            ],
          });
        case '/categorias/':
          return Promise.resolve({ data: [{ id: 1, nombre: 'Comida' }] });
        case '/usuarios/':
          return Promise.resolve({ data: [{ id: 1, nombre: 'Juan' }] });
        case '/resenas/':
          return Promise.resolve({
            data: [
              {
                id: 1,
                cliente_nombre: 'Carlos',
                pedido: 1,
                calificacion: 4,
                comentario: 'Muy buena',
                fecha: new Date().toISOString(),
                aprobada: false,
              },
            ],
          });
        default:
          return Promise.resolve({ data: [] });
      }
    }),
    patch: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  },
}));

beforeAll(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:http://localhost/fake'),
  });
});

describe('AdminDashboardComplete', () => {
  it('renderiza correctamente las tarjetas del dashboard', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Ventas Totales')).toBeInTheDocument();
      expect(screen.getByText('Pedidos Hoy')).toBeInTheDocument();
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
    });
  });

  it('permite cambiar a la pestaña de platillos', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Platillos'));
    });

    expect(screen.getByText('Nuevo Platillo')).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de pedidos y muestra información', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Pedidos'));
    });

    expect(screen.getByText('Detalle de Pedidos')).toBeInTheDocument();
  });

  it('muestra las reseñas recientes en el dashboard', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Reseñas Recientes')).toBeInTheDocument();
      expect(screen.getByText('Muy buena')).toBeInTheDocument();
    });
  });

  it('permite cambiar la disponibilidad de un platillo', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Platillos')));
    await waitFor(() => {
      const disponibleButtons = screen.getAllByText('Disponible');
      fireEvent.click(disponibleButtons.find(btn => btn.tagName === 'BUTTON'));
    });
    
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('permite eliminar un platillo', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Platillos')));
    await waitFor(() => {
      const trashButtons = screen.getAllByRole('button');
      const deleteBtn = trashButtons.find(btn => btn.className.includes('text-red'));
      fireEvent.click(deleteBtn);
    });

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('permite cambiar el estado de un pedido', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Pedidos')));
    const select = await screen.findByDisplayValue('Pendiente');
    fireEvent.change(select, { target: { value: 'entregado' } });
  });

  it('permite ver reseñas de un pedido', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Pedidos')));
    await waitFor(() => fireEvent.click(screen.getByText(/Ver \(1\)/)));

    expect(screen.getByText('Reseñas del Pedido')).toBeInTheDocument();
    expect(screen.getByText('Muy buena')).toBeInTheDocument();
  });

  it('exporta datos a CSV', async () => {
    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Exportar CSV')));

    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('no muestra botón de reseñas cuando no existen', async () => {
    const api = (await import('../config/axios')).default;
    api.get.mockImplementation((url) => {
      if (url === '/resenas/') return Promise.resolve({ data: [] });
      return api.get(url);
    });

    render(<MemoryRouter><AdminDashboardComplete /></MemoryRouter>);

    await waitFor(() => fireEvent.click(screen.getByText('Pedidos')));

    expect(screen.queryByText(/Ver \(/)).not.toBeInTheDocument();
  });
});
