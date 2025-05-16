// src/components/PrivateRoute.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import useStore from '../store/useStore';

// Mock del store
vi.mock('../store/useStore', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige al login si no hay usuario', () => {
    useStore.mockReturnValue(null); // No autenticado

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route
            path="/protegido"
            element={
              <PrivateRoute>
                <div>Contenido Privado</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/página de login/i)).toBeInTheDocument();
  });

  it('muestra el contenido si el usuario está autenticado', () => {
    useStore.mockReturnValue({ username: 'juan' }); // Usuario autenticado

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route
            path="/protegido"
            element={
              <PrivateRoute>
                <div>Contenido Privado</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/contenido privado/i)).toBeInTheDocument();
  });
});
