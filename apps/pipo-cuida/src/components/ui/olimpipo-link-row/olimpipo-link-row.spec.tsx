import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OlimpipoLinkRow } from './olimpipo-link-row';

describe('OlimpipoLinkRow', () => {
  it('renders the Olimpipo label and the "Edição ativa" badge', () => {
    render(<OlimpipoLinkRow />);
    expect(screen.getByText('Olimpipo')).toBeInTheDocument();
    expect(screen.getByText(/edição ativa/i)).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<OlimpipoLinkRow onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
