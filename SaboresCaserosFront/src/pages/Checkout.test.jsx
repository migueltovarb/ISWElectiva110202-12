// src/pages/Checkout.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Checkout from './Checkout';
import { BrowserRouter } from 'react-router-dom';
import { vi, it } from 'vitest';
import useStore from '../store/useStore';
import api from '../config/axios';

// Mock global de useStore
vi.mock('../store/useStore');
vi.mock('../config/axios');

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Checkout.jsx', () => {
  beforeEach(() => {
    useStore.mockReturnValue({
      cart: [
        { id: 1, nombre: 'Pizza Margarita', cantidad: 2, precio: 20000 }
      ],
      getCartTotal: () => 40000,
      clearCart: vi.fn(),
      user: { direccion: 'Calle 123' }
    });

    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 10 } });
  });

  it('debe renderizar correctamente el resumen del pedido', async () => {
    renderWithRouter(<Checkout />);
    expect(await screen.findByText('Pizza Margarita x 2')).toBeInTheDocument();
    const totales = screen.getAllByText('$40000.00');
    expect(totales.length).toBeGreaterThanOrEqual(2); // Uno por producto, uno por total
  });

  it('debe mostrar métodos de pago guardados si existen', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: 1, numero_tarjeta: '1234', es_predeterminado: true }
      ]
    });

    renderWithRouter(<Checkout />);
    expect(await screen.findByText('•••• 1234')).toBeInTheDocument();
    expect(screen.getByText('Predeterminado')).toBeInTheDocument();
  });

  it('debe mostrar errores si se selecciona tarjeta y se envía vacío', async () => {
    renderWithRouter(<Checkout />);

    fireEvent.click(screen.getByLabelText('Tarjeta'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByText(/número de tarjeta requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument();
  });

  it('debe guardar un nuevo método de pago si el checkbox está activo', async () => {
    const postMock = vi.spyOn(api, 'post');
    postMock.mockResolvedValueOnce({ data: { id: 10 } }); // /pedidos/
    postMock.mockResolvedValueOnce({}); // /metodos-pago/

    renderWithRouter(<Checkout />);
    fireEvent.click(screen.getByLabelText('Tarjeta'));

    fireEvent.input(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '1111222233334444' },
    });
    fireEvent.input(screen.getByPlaceholderText('Como aparece en la tarjeta'), {
      target: { value: 'Juan Perez' },
    });
    fireEvent.input(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '12/30' },
    });
    fireEvent.input(screen.getByPlaceholderText('123'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByLabelText(/guardar este método de pago/i));
    fireEvent.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(2);
    });
  });

  it('debe mostrar la información de transferencia al seleccionar ese método', () => {
    renderWithRouter(<Checkout />);
    fireEvent.click(screen.getByLabelText('Transferencia'));

    expect(screen.getByText(/Banco: Banco Ejemplo/i)).toBeInTheDocument();
    expect(screen.getByText(/Envía el comprobante/i)).toBeInTheDocument();
  });

  it('debe asignar automáticamente fecha_entrega al cargar', () => {
    renderWithRouter(<Checkout />);
    const input = screen.getByLabelText(/fecha y hora de entrega/i);
    expect(input.value).not.toBe('');
  });

  it('debe enviar el formulario correctamente', async () => {
    const clearCart = vi.fn();
    useStore.mockReturnValueOnce({
      cart: [{ id: 1, nombre: 'Pizza Margarita', cantidad: 2, precio: 20000 }],
      getCartTotal: () => 40000,
      clearCart,
      user: { direccion: 'Calle 456' }
    });

    renderWithRouter(<Checkout />);
    fireEvent.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
