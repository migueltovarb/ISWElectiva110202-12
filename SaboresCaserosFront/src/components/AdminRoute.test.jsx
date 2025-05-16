/* eslint-env vitest */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminRoute from './AdminRoute'
import { vi, describe, test, expect, beforeEach } from 'vitest'

// Controlamos el usuario simulado desde aquí
let mockUser = null

// Mock global de useStore, usará `mockUser` actual
vi.mock('../store/useStore', () => ({
  default: (selector) => selector({ user: mockUser })
}))

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: MemoryRouter })
}

describe('AdminRoute', () => {
  beforeEach(() => {
    mockUser = null // Reinicia el estado antes de cada test
  })

  test('redirige al home si no hay usuario', () => {
    renderWithRouter(
      <AdminRoute>
        <div>Contenido privado</div>
      </AdminRoute>
    )
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  test('redirige al home si el usuario no es staff', () => {
    mockUser = { is_staff: false }

    renderWithRouter(
      <AdminRoute>
        <div>Sólo Admin</div>
      </AdminRoute>
    )

    expect(screen.queryByText('Sólo Admin')).not.toBeInTheDocument()
  })

  test('muestra el contenido si el usuario es admin', () => {
    mockUser = { is_staff: true }

    renderWithRouter(
      <AdminRoute>
        <div>Panel del Admin</div>
      </AdminRoute>
    )

    expect(screen.getByText('Panel del Admin')).toBeInTheDocument()
  })
})
