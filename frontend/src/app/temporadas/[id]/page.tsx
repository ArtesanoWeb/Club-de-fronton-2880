'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { seasonsApi } from '@/lib/api/seasons';
import { SeasonStatusBadge } from '@/components/season-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function StandingsSection({ seasonId }: { seasonId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['seasons', seasonId, 'standings'],
    queryFn: () => seasonsApi.getStandings(seasonId),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando tabla de posiciones...</p>;
  if (isError) return <p className="text-sm text-destructive">No se pudo cargar la tabla de posiciones.</p>;
  if (!data || (data.individual.length === 0 && data.duos.length === 0)) {
    return <p className="text-sm text-muted-foreground">Todavía no hay partidos registrados en esta temporada.</p>;
  }

  return (
    <Tabs defaultValue="individual">
      <TabsList>
        <TabsTrigger value="individual">Individual</TabsTrigger>
        <TabsTrigger value="duplas">Duplas</TabsTrigger>
      </TabsList>
      <TabsContent value="individual" className="mt-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-right">PJ</TableHead>
                <TableHead className="text-right">V-D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.individual.map((row, i) => (
                <TableRow key={row.playerId}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {row.player.nickname || row.player.name}
                  </TableCell>
                  <TableCell className="text-right">{row.matchesPlayed}</TableCell>
                  <TableCell className="text-right">
                    {row.wins}-{row.losses}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="duplas" className="mt-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Dupla</TableHead>
                <TableHead className="text-right">PJ</TableHead>
                <TableHead className="text-right">V-D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.duos.map((row, i) => (
                <TableRow key={row.duoId}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {row.duo.player1.nickname || row.duo.player1.name} /{' '}
                    {row.duo.player2.nickname || row.duo.player2.name}
                  </TableCell>
                  <TableCell className="text-right">{row.matchesPlayed}</TableCell>
                  <TableCell className="text-right">
                    {row.wins}-{row.losses}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
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
    <div className="container mx-auto max-w-3xl space-y-6 p-4 sm:p-6 md:p-8">
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

      <div>
        <h2 className="mb-3 text-lg font-semibold text-primary">Tabla de posiciones</h2>
        <StandingsSection seasonId={id} />
      </div>
    </div>
  );
}
