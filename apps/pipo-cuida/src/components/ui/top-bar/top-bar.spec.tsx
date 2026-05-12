import { render, screen } from '@testing-library/react';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  it('renders the wordmark, "Meus dados" and "Sair" links', () => {
    render(<TopBar />);
    expect(screen.getByAltText('Pipo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /meus dados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sair/i })).toBeInTheDocument();
  });
});
