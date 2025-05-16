// src/pages/Cart.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';

const mockStore = {
  cart: [
    {
      id: 1,
      nombre: 'Pizza Margarita',
      precio: 20000,
      cantidad: 2,
      imagen_principal: '/pizza.jpg',
    },
  ],
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  getCartTotal: () => 40000,
};

// Mockear useStore para devolver el mockStore
vi.mock('../store/useStore', () => {
  return {
    default: () => mockStore,
  };
});

describe('Cart.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar los elementos del carrito y el total', () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
    expect(screen.getByText('Pizza Margarita')).toBeInTheDocument();
    expect(screen.getByText('$20000')).toBeInTheDocument();
    expect(screen.getByText('Total: $40000.00')).toBeInTheDocument();
  });

  it('debe llamar a updateQuantity al aumentar o disminuir cantidad', () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    const increaseBtn = buttons.find((btn) =>
      btn.innerHTML.includes('plus') || btn.querySelector('svg.lucide-plus')
    );
    const decreaseBtn = buttons.find((btn) =>
      btn.innerHTML.includes('minus') || btn.querySelector('svg.lucide-minus')
    );

    fireEvent.click(increaseBtn);
    expect(mockStore.updateQuantity).toHaveBeenCalledWith(1, 3);

    fireEvent.click(decreaseBtn);
    expect(mockStore.updateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('debe eliminar un producto del carrito al hacer clic en el ícono de eliminar', () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const deleteBtn = screen.getAllByRole('button').find((btn) =>
      btn.className.includes('text-red-500')
    );

    fireEvent.click(deleteBtn);
    expect(mockStore.removeFromCart).toHaveBeenCalledWith(1);
  });
});
