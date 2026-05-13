import { createFileRoute } from '@tanstack/react-router';
import { OlimpipoPage } from '@/pages/olimpipo-page';

export const Route = createFileRoute('/olimpipo')({
  validateSearch: (search) => ({
    participant_id: String(search.participant_id ?? ''),
    company_id: String(search.company_id ?? 'pipo-hackathon'),
  }),
  component: OlimpipoPage,
});
