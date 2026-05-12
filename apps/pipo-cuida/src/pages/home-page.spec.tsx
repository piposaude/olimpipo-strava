import { render, screen } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { HomePage } from './home-page';

function renderHomePage() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('HomePage', () => {
  it('renders the survey banner, help heading, all five quick links and the partner card', async () => {
    renderHomePage();
    expect(await screen.findByRole('button', { name: /como anda sua saúde/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /como podemos te ajudar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /falar com o time de saúde/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar rede credenciada/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carteirinhas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fazer check-up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tirar dúvidas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /programa pinguim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /olimpipo.*edição ativa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pipo \+ beep saúde/i })).toBeInTheDocument();
  });
});
