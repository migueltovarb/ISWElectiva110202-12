
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../config/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra errores si los campos están vacíos', async () => {
    renderWithRouter(<Register />);
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/usuario requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/email requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña requerida/i)).toBeInTheDocument();
      expect(screen.getByText(/confirma tu contraseña/i)).toBeInTheDocument();
      expect(screen.getAllByText(/selecciona una pregunta/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/respuesta requerida/i)).toBeInTheDocument();
    });
  });

  it('registra exitosamente al usuario', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'OK' } });

    renderWithRouter(<Register />);
    fireEvent.input(screen.getByPlaceholderText(/usuario/i), {
      target: { value: 'juanito' },
    });
    fireEvent.input(screen.getByPlaceholderText(/tu@email.com/i), {
      target: { value: 'juan@email.com' },
    });
    fireEvent.input(screen.getByPlaceholderText(/mínimo 6 caracteres/i), {
      target: { value: '123456' },
    });
    fireEvent.input(screen.getByPlaceholderText(/repite tu contraseña/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '¿Cuál es tu comida favorita?' },
    });
    fireEvent.input(screen.getByPlaceholderText(/tu respuesta/i), {
      target: { value: 'Pizza' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Registro exitoso'));
    });
  });

  it('muestra error si la API falla', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { detail: 'Error en el registro' } } });

    renderWithRouter(<Register />);
    fireEvent.input(screen.getByPlaceholderText(/usuario/i), {
      target: { value: 'juanito' },
    });
    fireEvent.input(screen.getByPlaceholderText(/tu@email.com/i), {
      target: { value: 'juan@email.com' },
    });
    fireEvent.input(screen.getByPlaceholderText(/mínimo 6 caracteres/i), {
      target: { value: '123456' },
    });
    fireEvent.input(screen.getByPlaceholderText(/repite tu contraseña/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '¿Cuál es tu comida favorita?' },
    });
    fireEvent.input(screen.getByPlaceholderText(/tu respuesta/i), {
      target: { value: 'Pizza' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Error en el registro'));
    });
  });
});
