import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BigTile } from './big-tile';

describe('BigTile', () => {
  it('renders title and illustration', () => {
    const { container } = render(<BigTile title="Falar com o time de saúde" illustrationSrc="/assets/illustrations/especialista.svg" />);
    expect(screen.getByText(/falar com o time de saúde/i)).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/illustrations/especialista.svg');
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<BigTile title="Buscar rede credenciada" illustrationSrc="/assets/illustrations/spot-rede.svg" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
