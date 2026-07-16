import { Badge } from '@/components/ui/badge';
import type { MatchModality } from '@/lib/api/matches';

const LABELS: Record<MatchModality, string> = {
  TEMPORADA_OFICIAL: 'Temporada Oficial',
  REY_DE_CANCHA: 'Rey de Cancha',
  RETO: 'Reto',
  AMISTOSO: 'Amistoso',
};

const VARIANTS: Record<MatchModality, 'default' | 'secondary' | 'outline'> = {
  TEMPORADA_OFICIAL: 'default',
  REY_DE_CANCHA: 'secondary',
  RETO: 'outline',
  AMISTOSO: 'outline',
};

export function MatchModalityBadge({ modality }: { modality: MatchModality }) {
  return <Badge variant={VARIANTS[modality]}>{LABELS[modality]}</Badge>;
}
