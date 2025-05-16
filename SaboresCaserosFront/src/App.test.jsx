/* eslint-env vitest */
import { render, screen } from '@testing-library/react'
import App from './App'
import { vi } from 'vitest'

// Mock del Toaster
vi.mock('react-hot-toast', () => ({
  Toaster: () => <div>Toaster</div>
}))

// Mock del store
vi.mock('./store/useStore', () => ({
  default: () => ({
    setUser: () => {}
  })
}))

// Mock del axios
vi.mock('./config/axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { name: 'Test User' } })
  }
}))

describe('App.jsx', () => {
  test('Renderiza App sin errores', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument() // depende de cómo esté estructurado tu HTML
  })
})
