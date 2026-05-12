import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerCard } from './partner-card';

describe('PartnerCard', () => {
  it('renders eyebrow, title and subtitle', () => {
    render(
      <PartnerCard
        eyebrow="Pipo + Beep Saúde"
        title="Vacinas à domicílio com desconto."
        subtitle="Acesse o benefício com cupom PIPOSAUDE"
      />,
    );
    expect(screen.getByText(/pipo \+ beep saúde/i)).toBeInTheDocument();
    expect(screen.getByText(/vacinas à domicílio com desconto\./i)).toBeInTheDocument();
    expect(screen.getByText(/acesse o benefício com cupom piposaude/i)).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(
      <PartnerCard
        eyebrow="Pipo + Beep Saúde"
        title="Vacinas à domicílio com desconto."
        subtitle="Acesse o benefício com cupom PIPOSAUDE"
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
