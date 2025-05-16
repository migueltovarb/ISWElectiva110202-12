import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import api from '../config/axios';
import useStore from '../store/useStore';
import { toast } from 'react-hot-toast';

vi.mock('../config/axios');
vi.mock('../store/useStore', () => ({
  default: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Login', () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useStore.mockReturnValue(mockSetUser);
  });

  it('renderiza correctamente el formulario', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ingresa tu usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ingresa tu contraseña/i)).toBeInTheDocument();
  });

  it('valida que los campos sean obligatorios', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/usuario requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña requerida/i)).toBeInTheDocument();
    });
  });

  it('realiza login exitosamente y guarda el token', async () => {
    const mockToken = '123abc';
    const mockUser = { username: 'juan', rol: 'cliente' };

    api.post.mockResolvedValueOnce({ data: { access: mockToken } });
    api.get.mockResolvedValueOnce({ data: mockUser });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'juan' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(toast.success).toHaveBeenCalledWith('¡Bienvenido!');
    });
  });

  it('muestra error si las credenciales son incorrectas', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'Credenciales inválidas' } },
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'fakeuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas');
    });
  });
});
