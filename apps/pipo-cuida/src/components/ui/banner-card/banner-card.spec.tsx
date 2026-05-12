import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BannerCard } from './banner-card';

describe('BannerCard', () => {
  it('renders title and subtitle', () => {
    render(<BannerCard title="Como anda sua saúde?" subtitle="Complete o questionário." />);
    expect(screen.getByText(/como anda sua saúde/i)).toBeInTheDocument();
    expect(screen.getByText(/complete o questionário/i)).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<BannerCard title="Como anda sua saúde?" subtitle="Complete o questionário." onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
