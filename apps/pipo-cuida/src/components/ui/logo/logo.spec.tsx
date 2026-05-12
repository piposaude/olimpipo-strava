import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders the pipo wordmark with accessible alt text', () => {
    render(<Logo />);
    const img = screen.getByAltText('Pipo');
    expect(img).toHaveAttribute('src', '/assets/logos/pipo-wordmark.svg');
  });
});
