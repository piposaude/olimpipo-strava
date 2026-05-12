import { createFileRoute } from '@tanstack/react-router';
import { EmBrevePage } from '@/pages/em-breve-page';

export const Route = createFileRoute('/$')({ component: EmBrevePage });
