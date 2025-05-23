import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { toast } from 'react-hot-toast';
import { MemoryRouter } from 'react-router-dom';
import AdminPedidos from './AdminPedidos';
import api from '../config/axios';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children }) => <div>{children}</div>
  };
});

// Mock de lucide-react
vi.mock('lucide-react', () => ({
  Eye: () => <div>EyeIcon</div>,
  User: () => <div>UserIcon</div>,
  Calendar: () => <div>CalendarIcon</div>,
  DollarSign: () => <div>DollarSignIcon</div>
}));

// Mock de axios
vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const mockPedidos = [
  {
    id: 1,
    cliente_nombre: 'Juan Pérez',
    cliente_email: 'juan@mail.com',
    estado: 'pendiente',
    fecha_pedido: '2023-05-18T12:00:00Z',
    total: 30000,
    detalles: [
      {
        id: 10,
        platillo_nombre: 'Pizza',
        cantidad: 2,
        subtotal: 30000
      }
    ],
    notas: 'Sin cebolla por favor'
  },
  {
    id: 2,
    cliente_nombre: 'María García',
    cliente_email: 'maria@mail.com',
    estado: 'confirmado',
    fecha_pedido: '2023-05-17T10:30:00Z',
    total: 15000,
    detalles: [
      {
        id: 11,
        platillo_nombre: 'Hamburguesa',
        cantidad: 1,
        subtotal: 15000
      }
    ],
    notas: null
  }
];

describe('AdminPedidos', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks();
    
    // Configurar mock para api.get
    api.get.mockResolvedValue({ data: mockPedidos });
    
    // Mock de console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe mostrar el loader mientras carga', async () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('debe cargar y mostrar los pedidos correctamente', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Gestión de Pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/juan@mail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Pizza x 2 - \$30000/i)).toBeInTheDocument();
    expect(screen.getByText(/Hamburguesa x 1 - \$15000/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin cebolla por favor/i)).toBeInTheDocument();
  });

  it('debe mostrar error cuando falla la carga de pedidos', async () => {
    const error = new Error('Error de red');
    api.get.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar pedidos');
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  it('debe filtrar pedidos por estado', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);

    // Usamos getAllByRole y seleccionamos el primer combobox (el de filtro)
    const selects = screen.getAllByRole('combobox');
    const filterSelect = selects[0];
    
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'pendiente' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      expect(screen.queryByText(/María García/i)).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'confirmado' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/María García/i)).toBeInTheDocument();
      expect(screen.queryByText(/Juan Pérez/i)).not.toBeInTheDocument();
    });
  });

  it('debe cambiar el estado de un pedido correctamente', async () => {
    api.post.mockResolvedValue({});

    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);

    // Usamos getAllByRole y seleccionamos el segundo combobox (el de estado del pedido)
    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[1];
    
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'confirmado' } });
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/pedidos/1/cambiar_estado/',
        { estado: 'confirmado' }
      );
      expect(toast.success).toHaveBeenCalledWith('Estado actualizado');
      expect(api.get).toHaveBeenCalledTimes(2); // Una vez inicial y otra después del cambio
    });
  });

  it('debe mostrar error cuando falla el cambio de estado', async () => {
    const error = new Error('Error de red');
    api.post.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[1];
    
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'confirmado' } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar estado');
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  it('debe aplicar las clases CSS correctas según el estado', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);

    const selects = screen.getAllByRole('combobox');
    const pendienteSelect = selects[1];
    const confirmadoSelect = selects[2];
    
    expect(pendienteSelect.className).toContain('bg-yellow-100');
    expect(pendienteSelect.className).toContain('text-yellow-800');
    expect(pendienteSelect.className).toContain('border-yellow-200');
    
    expect(confirmadoSelect.className).toContain('bg-blue-100');
    expect(confirmadoSelect.className).toContain('text-blue-800');
    expect(confirmadoSelect.className).toContain('border-blue-200');
  });

  it('debe mostrar el enlace de ver detalles para cada pedido', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);
    
    // Usamos getAllByText ya que hay múltiples elementos con el mismo texto
    const detallesLinks = screen.getAllByText(/Ver detalles/i);
    expect(detallesLinks).toHaveLength(2);
    expect(screen.getAllByText(/EyeIcon/i)).toHaveLength(2);
  });

  it('debe formatear correctamente la fecha', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/Juan Pérez/i);
    const fechaElement = screen.getByText(/18\/5\/2023/);
    expect(fechaElement).toBeInTheDocument();
  });

  it('no debe mostrar notas si no existen', async () => {
    render(
      <MemoryRouter>
        <AdminPedidos />
      </MemoryRouter>
    );

    await screen.findByText(/María García/i);
    
    // Verificamos que no se muestre el texto "Notas:" para el pedido sin notas
    const notasElements = screen.queryAllByText(/Notas:/i);
    expect(notasElements).toHaveLength(1); // Solo debería estar en el primer pedido
  });
});