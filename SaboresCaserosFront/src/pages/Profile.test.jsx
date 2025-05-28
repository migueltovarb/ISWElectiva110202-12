// src/pages/Profile.test.jsx
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import api from '../config/axios';
import useStore from '../store/useStore';
import { toast } from 'react-hot-toast';

vi.mock('../config/axios');
vi.mock('react-hot-toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../store/useStore');

const mockUser = {
  id: 1,
  first_name: 'Juan',
  last_name: 'Pérez',
  email: 'juan@email.com',
  telefono: '1234567890',
  direccion: 'Calle falsa 123',
  foto_perfil: '/media/perfil.jpg'
};

const mockSetUser = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  useStore.mockImplementation((fn) => {
    return fn({ user: mockUser, setUser: mockSetUser });
  });
});

describe('Profile', () => {
  it('muestra spinner mientras carga', async () => {
    api.get.mockImplementationOnce(() => new Promise(() => {}));
    render(<Profile />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renderiza el perfil correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: mockUser });
    render(<Profile />);
    await waitFor(() => expect(screen.getByDisplayValue('Juan')).toBeInTheDocument());
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('juan@email.com')).toBeInTheDocument();
  });

  it('muestra error si falla la carga del perfil', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    render(<Profile />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar perfil');
    });
  });

  it('envía el formulario exitosamente', async () => {
    const patchMock = { data: mockUser };
    api.get.mockResolvedValueOnce({ data: mockUser });
    api.patch.mockResolvedValueOnce(patchMock);

    render(<Profile />);
    await waitFor(() => screen.getByDisplayValue('Juan'));

    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Pedro' } });
    fireEvent.click(screen.getByText(/guardar cambios/i));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Perfil actualizado');
    });
  });

  it('muestra error si falla el update', async () => {
    api.get.mockResolvedValueOnce({ data: mockUser });
    api.patch.mockRejectedValueOnce({ response: { data: { detail: 'Error del servidor' } } });

    render(<Profile />);
    await waitFor(() => screen.getByDisplayValue('Juan'));
    fireEvent.click(screen.getByText(/guardar cambios/i));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error: Error del servidor');
    });
  });

  it('muestra error si imagen no es válida', async () => {
    api.get.mockResolvedValueOnce({ data: mockUser });
    render(<Profile />);
    await waitFor(() => screen.getByDisplayValue('Juan'));

    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    const invalidFile = new File(['bad'], 'bad.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    expect(toast.error).toHaveBeenCalledWith('El archivo debe ser una imagen');
  });

  it('muestra error si imagen supera el tamaño límite', async () => {
    api.get.mockResolvedValueOnce({ data: mockUser });
    render(<Profile />);
    await waitFor(() => screen.getByDisplayValue('Juan'));

    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    const bigFile = new File(['a'.repeat(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [bigFile] } });
    expect(toast.error).toHaveBeenCalledWith('La imagen no debe superar los 5MB');
  });
});
