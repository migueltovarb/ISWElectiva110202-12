import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PaymentMethods from '../pages/PaymentMethods';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

vi.mock('../config/axios');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../components/PaymentMethodModal', () => ({
  default: ({ onClose, onSave }) => (
    <div>
      <button onClick={onClose}>Cerrar Modal</button>
      <button onClick={onSave}>Guardar Método</button>
    </div>
  ),
}));

describe('PaymentMethods', () => {
  const metodosMock = [
    {
      id: 1,
      tipo_display: 'Tarjeta de Crédito',
      numero_tarjeta: '1234',
      nombre_titular: 'Juan Pérez',
      fecha_expiracion: '12/25',
      es_predeterminado: true,
    },
    {
      id: 2,
      tipo_display: 'Tarjeta de Débito',
      numero_tarjeta: '5678',
      nombre_titular: 'Luis Gómez',
      fecha_expiracion: '11/24',
      es_predeterminado: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner mientras carga', async () => {
    api.get.mockImplementationOnce(() => new Promise(() => {}));
    render(<PaymentMethods />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renderiza métodos de pago correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: metodosMock });
    render(<PaymentMethods />);
    await waitFor(() => {
      expect(screen.getByText(/tarjeta de crédito/i)).toBeInTheDocument();
      expect(screen.getByText(/\*\*\*\*1234/)).toBeInTheDocument();
      expect(screen.getByText(/tarjeta de débito/i)).toBeInTheDocument();
    });
  });

  it('muestra error si falla la carga', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    render(<PaymentMethods />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar métodos de pago');
    });
  });

  it('abre el modal al hacer clic en agregar método', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<PaymentMethods />);
    await waitFor(() => {
      fireEvent.click(screen.getByText(/agregar método/i));
    });
    expect(screen.getByText(/cerrar modal/i)).toBeInTheDocument();
  });

  it('cierra el modal y actualiza después de guardar', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<PaymentMethods />);
    await waitFor(() => fireEvent.click(screen.getByText(/agregar método/i)));
    fireEvent.click(screen.getByText(/guardar método/i));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

it('elimina un método correctamente', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  api.get.mockResolvedValueOnce({ data: metodosMock });
  api.delete.mockResolvedValueOnce({});

  render(<PaymentMethods />);
  await waitFor(() => screen.getByText('Métodos de Pago')); // espera carga

  fireEvent.click(screen.getByLabelText('Eliminar método 1')); // ✅ uso de aria-label

  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith('/metodos-pago/1/');
    expect(toast.success).toHaveBeenCalledWith('Método de pago eliminado');
  });
});

it('muestra error si falla la eliminación', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  api.get.mockResolvedValueOnce({ data: metodosMock });
  api.delete.mockRejectedValueOnce(new Error('Error'));

  render(<PaymentMethods />);
  await waitFor(() => screen.getByText('Métodos de Pago'));

  fireEvent.click(screen.getByLabelText('Eliminar método 1')); // ✅ uso de aria-label

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Error al eliminar');
  });
});


  it('marca como predeterminado correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: metodosMock });
    api.post.mockResolvedValueOnce({});
    render(<PaymentMethods />);
    await waitFor(() => fireEvent.click(screen.getByText(/hacer predeterminado/i)));
    expect(api.post).toHaveBeenCalledWith('/metodos-pago/2/set-default/');
    expect(toast.success).toHaveBeenCalledWith('Método predeterminado actualizado');
  });

  it('muestra error si falla el set default', async () => {
    api.get.mockResolvedValueOnce({ data: metodosMock });
    api.post.mockRejectedValueOnce(new Error('Error'));
    render(<PaymentMethods />);
    await waitFor(() => fireEvent.click(screen.getByText(/hacer predeterminado/i)));
    expect(toast.error).toHaveBeenCalledWith('Error al actualizar');
  });
});
