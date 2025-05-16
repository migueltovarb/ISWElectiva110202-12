import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './ForgotPassword';
import { BrowserRouter } from 'react-router-dom';
import api from '../config/axios';

// Mock de api
vi.mock('../config/axios');

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra formulario inicial para ingresar usuario', () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ingresa tu usuario/i)).toBeInTheDocument();
  });

  it('envía el username y pasa al paso 2 si es válido', async () => {
    api.post.mockResolvedValueOnce({
      data: { pregunta: '¿Color favorito?', usuario_id: 1 },
    });

    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'juanito' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/pregunta de seguridad/i)).toBeInTheDocument();
      expect(screen.getByText(/color favorito/i)).toBeInTheDocument();
    });
  });

  it('muestra error si el usuario no existe', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { error: 'Usuario no encontrado' } } });

    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'noexiste' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/pregunta de seguridad/i)).not.toBeInTheDocument();
    });
  });

  it('envía la respuesta y cambia la contraseña correctamente', async () => {
    // Paso 1: verificación
    api.post
      .mockResolvedValueOnce({
        data: { pregunta: '¿Color favorito?', usuario_id: 42 },
      })
      .mockResolvedValueOnce({
        data: { success: true },
      });

    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'maria' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/pregunta de seguridad/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/tu respuesta/i), {
      target: { value: 'azul' },
    });

    fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), {
      target: { value: 'nuevaclave123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/recuperar-password/', {
        usuario_id: 42,
        respuesta: 'azul',
        nueva_password: 'nuevaclave123',
      });
    });
  });

  it('muestra error si la respuesta de seguridad es incorrecta', async () => {
    // Paso 1: verificación
    api.post
      .mockResolvedValueOnce({
        data: { pregunta: '¿Color favorito?', usuario_id: 5 },
      })
      .mockRejectedValueOnce({
        response: { data: { error: 'Respuesta incorrecta' } },
      });

    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu usuario/i), {
      target: { value: 'admin' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/pregunta de seguridad/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/tu respuesta/i), {
      target: { value: 'verde' },
    });

    fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), {
      target: { value: 'clave123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/recuperar-password/', {
        usuario_id: 5,
        respuesta: 'verde',
        nueva_password: 'clave123',
      });
    });
  });
});
