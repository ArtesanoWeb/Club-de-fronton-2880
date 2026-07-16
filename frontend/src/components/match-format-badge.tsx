import { Badge } from '@/components/ui/badge';
import type { MatchFormat } from '@/lib/api/matches';

const LABELS: Record<MatchFormat, string> = {
  BLITZ: 'Blitz',
  CAMPEONATO: 'Campeonato',
};

export function MatchFormatBadge({ format }: { format: MatchFormat }) {
  return <Badge variant="secondary">{LABELS[format]}</Badge>;
}
