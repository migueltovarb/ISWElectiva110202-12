import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Menu from './Menu';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../store/useStore', () => ({
  __esModule: true,
  default: () => ({
    addToCart: vi.fn(),
  }),
}));

describe('Menu Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente los platillos y categorías', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/platillos/') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Pizza', precio: 20000, descripcion: 'Deliciosa', imagen: '', disponible: true, categoria: 1 },
            { id: 2, nombre: 'Hamburguesa', precio: 18000, descripcion: 'Con papas', imagen: '', disponible: true, categoria: 2 },
          ],
        });
      }
      if (url === '/categorias/') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Italiana' },
            { id: 2, nombre: 'Americana' },
          ],
        });
      }
    });

    render(<Menu />);

    // Espera a que aparezcan los textos
    expect(await screen.findByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
    expect(screen.getByText('Italiana')).toBeInTheDocument();
    expect(screen.getByText('Americana')).toBeInTheDocument();
  });

  it('muestra mensaje de error si falla la carga', async () => {
    api.get.mockRejectedValue(new Error('Error al cargar datos'));

    render(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el menú')).toBeInTheDocument();
    });
  });

  it('filtra por categoría seleccionada', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/platillos/') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Pizza', precio: 20000, descripcion: '', imagen: '', disponible: true, categoria: 1 },
            { id: 2, nombre: 'Hamburguesa', precio: 18000, descripcion: '', imagen: '', disponible: true, categoria: 2 },
          ],
        });
      }
      if (url === '/categorias/') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Italiana' },
            { id: 2, nombre: 'Americana' },
          ],
        });
      }
    });

    render(<Menu />);

    await screen.findByText('Pizza');

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Hamburguesa')).not.toBeInTheDocument();
    });
  });
});