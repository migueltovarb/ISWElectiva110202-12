/* eslint-env vitest */
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { vi } from 'vitest'

// Variable global que simula el store
let mockUser = null
let mockCart = []
let mockLogout = vi.fn()

// Mock de Zustand store personalizado
vi.mock('../store/useStore', () => ({
  default: () => ({
    user: mockUser,
    cart: mockCart,
    logout: mockLogout,
  }),
}))

const renderNavbar = () => {
  return render(<Navbar />, { wrapper: MemoryRouter })
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUser = null
    mockCart = []
    mockLogout = vi.fn()
  })

  test('muestra el botón de login si no hay usuario', () => {
    renderNavbar()
    expect(screen.getByText(/ingresar/i)).toBeInTheDocument()
  })

  test('muestra el nombre del usuario autenticado', () => {
    mockUser = {
      username: 'juan123',
      first_name: 'Juan',
      last_name: 'Pérez',
      is_staff: false,
      foto_perfil: null,
    }

    renderNavbar()

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
    expect(screen.getByText(/Mi Perfil/)).toBeInTheDocument()
  })

  test('muestra el badge del carrito si hay productos', () => {
    mockUser = { username: 'test', is_staff: false }
    mockCart = [1, 2, 3] // simula 3 productos

    renderNavbar()

    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
  })

  test('muestra el link Dashboard si el usuario es admin', () => {
    mockUser = {
      username: 'admin',
      first_name: 'Admin',
      is_staff: true,
      foto_perfil: null,
    }

    renderNavbar()

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Admin/)).toBeInTheDocument()
  })

  test('llama a logout al hacer clic en el botón', () => {
    mockUser = { username: 'test', is_staff: false }
    renderNavbar()

    const logoutBtn = screen.getByRole('button')
    fireEvent.click(logoutBtn)

    expect(mockLogout).toHaveBeenCalled()
  })
})
