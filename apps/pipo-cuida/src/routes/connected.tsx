import { createFileRoute } from '@tanstack/react-router';
import { ConnectedPage } from '@/pages/connected-page';

export const Route = createFileRoute('/connected')({
  validateSearch: (search: Record<string, unknown>) => ({
    registered: Number(search.registered ?? 0),
  }),
  component: ConnectedPage,
});
