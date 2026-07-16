'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { seasonsApi } from '@/lib/api/seasons';
import { SeasonStatusBadge } from '@/components/season-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function TemporadaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    data: season,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['seasons', id],
    queryFn: () => seasonsApi.getSeason(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Cargando temporada...</p>
      </div>
    );
  }

  if (isError || !season) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <p className="text-sm text-destructive">Temporada no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-primary">{season.name}</CardTitle>
          <SeasonStatusBadge status={season.status} />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Inicio: </span>
            {formatDate(season.startDate)}
          </p>
          <p>
            <span className="text-muted-foreground">Fin: </span>
            {season.endDate ? formatDate(season.endDate) : 'Por definir'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
