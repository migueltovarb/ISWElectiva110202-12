import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlatilloModal from './PlatilloModal';
import { vi } from 'vitest';

const categorias = [{ id: 1, nombre: 'Entradas' }];
const onClose = vi.fn();
const onSave = vi.fn();

test('muestra errores si se envía vacío', async () => {
  render(<PlatilloModal onClose={onClose} onSave={onSave} categorias={categorias} />);

  // Espera a que cargue el formulario (spinner desaparezca)
  await screen.findByRole('heading', { name: /platillo/i });

  const submitBtn = await screen.findByRole('button', { name: /guardar/i });
  fireEvent.click(submitBtn);

  await waitFor(() => {
    expect(screen.getAllByText(/requerido/i).length).toBeGreaterThan(0);
  });
});

test('llama a onClose al hacer clic en Cancelar', async () => {
  render(<PlatilloModal onClose={onClose} onSave={onSave} categorias={categorias} />);

  await screen.findByRole('heading', { name: /platillo/i });

  const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
  fireEvent.click(cancelBtn);

  expect(onClose).toHaveBeenCalled();

  vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/usuarios/chefs/')) {
        return Promise.resolve({ data: [{ id: 1, nombre: 'Chef Juan' }] });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

});
