'use client';

import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';
import { matchesApi, type Duo } from '@/lib/api/matches';
import { MatchModalityBadge } from '@/components/match-modality-badge';
import { MatchFormatBadge } from '@/components/match-format-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function duoLabel(duo: Duo) {
  return `${duo.player1.nickname || duo.player1.name} / ${duo.player2.nickname || duo.player2.name}`;
}

export default function PartidosPage() {
  const {
    data: matches,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.getMatches,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2 sm:mb-8">
        <Target className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Partidos</h1>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando partidos...</p>}
      {isError && <p className="text-sm text-destructive">No se pudo cargar la lista de partidos.</p>}
      {matches && matches.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay partidos registrados.</p>
      )}

      {matches && matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <MatchModalityBadge modality={match.modality} />
                  <MatchFormatBadge format={match.format} />
                </div>
                <CardTitle className="text-base font-semibold">
                  {duoLabel(match.teamA)}
                  <span className="mx-1 font-normal text-muted-foreground">vs</span>
                  {duoLabel(match.teamB)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-lg font-bold text-primary">
                  {match.scoreA} - {match.scoreB}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.sets.map((s) => `${s.scoreA}-${s.scoreB}`).join(' · ')}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(match.playedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
