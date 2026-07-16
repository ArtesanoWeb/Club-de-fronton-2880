import { Badge } from '@/components/ui/badge';
import type { SeasonStatus } from '@/lib/api/seasons';

const LABELS: Record<SeasonStatus, string> = {
  UPCOMING: 'Próxima',
  ACTIVE: 'Activa',
  FINISHED: 'Finalizada',
};

const VARIANTS: Record<SeasonStatus, 'secondary' | 'default' | 'outline'> = {
  UPCOMING: 'secondary',
  ACTIVE: 'default',
  FINISHED: 'outline',
};

export function SeasonStatusBadge({ status }: { status: SeasonStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
