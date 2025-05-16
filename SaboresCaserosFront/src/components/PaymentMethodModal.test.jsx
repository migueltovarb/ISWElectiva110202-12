/* eslint-env vitest */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentMethodModal from './PaymentMethodModal'
import { vi } from 'vitest'

// Mock de react-hot-toast para evitar errores y verificar los mensajes
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock del API
vi.mock('../config/axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

describe('PaymentMethodModal', () => {
  const onClose = vi.fn()
  const onSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renderiza los campos correctamente', () => {
    render(<PaymentMethodModal onClose={onClose} onSave={onSave} />)
    expect(screen.getByText(/nuevo método de pago/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de pago/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del titular/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/número de tarjeta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de expiración/i)).toBeInTheDocument()
  })

  test('muestra errores si se envía vacío', async () => {
    render(<PaymentMethodModal onClose={onClose} onSave={onSave} />)

    fireEvent.click(screen.getByText(/guardar/i))

    await screen.findAllByText(/requerido/i)

    expect(screen.getAllByText(/requerido/i).length).toBeGreaterThan(1)
  })

  test('envía datos correctamente y llama a onSave', async () => {
    render(<PaymentMethodModal onClose={onClose} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText(/tipo de pago/i), {
      target: { value: 'paypal' },
    })
    fireEvent.change(screen.getByLabelText(/nombre del titular/i), {
      target: { value: 'Juan Pérez' },
    })
    fireEvent.change(screen.getByLabelText(/número de tarjeta/i), {
      target: { value: '1234567812345678' },
    })
    fireEvent.change(screen.getByLabelText(/fecha de expiración/i), {
      target: { value: '12/25' },
    })

    fireEvent.click(screen.getByText(/guardar/i))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  test('puede cerrar el modal al hacer clic en Cancelar', () => {
    render(<PaymentMethodModal onClose={onClose} onSave={onSave} />)
    fireEvent.click(screen.getByText(/cancelar/i))
    expect(onClose).toHaveBeenCalled()
  })
})
