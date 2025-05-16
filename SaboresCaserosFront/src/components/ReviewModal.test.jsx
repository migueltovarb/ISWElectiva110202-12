import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewModal from './ReviewModal';
import api from '../config/axios';

// Mock API
vi.mock('../config/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const pedidoMock = {
  detalles: [
    { platillo: 1 },
    { platillo: 2 },
  ],
};

const onClose = vi.fn();
const onSave = vi.fn();

describe('ReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente los elementos del formulario', () => {
    render(<ReviewModal pedido={pedidoMock} onClose={onClose} onSave={onSave} />);

    expect(screen.getByText(/califica tu pedido/i)).toBeInTheDocument();
    expect(screen.getByText(/calificación/i)).toBeInTheDocument();
    expect(screen.getByText(/comentario/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
    expect(screen.getByText(/enviar reseña/i)).toBeInTheDocument();
  });

  it('muestra errores si se envía vacío', async () => {
    render(<ReviewModal pedido={pedidoMock} onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getByText(/enviar reseña/i));

    await waitFor(() => {
      expect(screen.getByText(/calificación requerida/i)).toBeInTheDocument();
      expect(screen.getByText(/comentario requerido/i)).toBeInTheDocument();
    });
  });

  it('llama a onClose al presionar Cancelar', () => {
    render(<ReviewModal pedido={pedidoMock} onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByText(/cancelar/i));
    expect(onClose).toHaveBeenCalled();
  });

  it('envía la reseña correctamente y llama a onSave', async () => {
    api.post.mockResolvedValue({ data: {} });

    render(<ReviewModal pedido={pedidoMock} onClose={onClose} onSave={onSave} />);

    // Simular calificación con estrellas
    const estrellas = screen.getAllByRole('button');
    fireEvent.click(estrellas[4]); // 5 estrellas

    // Ingresar comentario
    fireEvent.change(screen.getByPlaceholderText(/cuéntanos tu experiencia/i), {
      target: { value: 'Todo estuvo excelente' },
    });

    fireEvent.click(screen.getByText(/enviar reseña/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(2); // Una por cada platillo
      expect(onSave).toHaveBeenCalled();
    });
  });
});
