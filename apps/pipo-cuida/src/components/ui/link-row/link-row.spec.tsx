import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkRow } from './link-row';

describe('LinkRow', () => {
  it('renders icon and label', () => {
    const { container } = render(<LinkRow iconSrc="/assets/icons/illus-benefit-card.svg" label="Carteirinhas" />);
    expect(screen.getByText(/carteirinhas/i)).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/icons/illus-benefit-card.svg');
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<LinkRow iconSrc="/assets/icons/illus-checkup.svg" label="Fazer check-up" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
