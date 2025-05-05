// src/store/useStore.js

import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    cart: [],
    
    setUser: (user) => set({ user }),
    
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, cart: [] });
    },
    
    addToCart: (platillo) => set((state) => {
        const exists = state.cart.find(item => item.id === platillo.id);
        if (exists) {
        return {
            cart: state.cart.map(item =>
            item.id === platillo.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            ),
        };
        }
        return { cart: [...state.cart, { ...platillo, cantidad: 1 }] };
    }),
    
    removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id),
    })),
    
    updateQuantity: (id, cantidad) => set((state) => ({
        cart: state.cart.map(item =>
        item.id === id ? { ...item, cantidad } : item
        ),
    })),
    
    clearCart: () => set({ cart: [] }),
    
    getCartTotal: () => {
        const { cart } = useStore.getState();
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },
}));

export default useStore;