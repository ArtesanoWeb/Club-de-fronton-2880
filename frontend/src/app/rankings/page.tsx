'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { rankingsApi } from '@/lib/api/rankings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function streakLabel(streak: number) {
  if (streak === 0) return '—';
  return streak > 0 ? `${streak}V` : `${Math.abs(streak)}D`;
}

function IndividualTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rankings', 'individual'],
    queryFn: rankingsApi.getIndividual,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando ranking...</p>;
  if (isError) return <p className="text-sm text-destructive">No se pudo cargar el ranking.</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay partidos que afecten el ranking.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Jugador</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
            <TableHead className="text-right">V-D</TableHead>
            <TableHead className="text-right">Racha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium text-foreground">
                {r.player.nickname || r.player.name}
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">{r.points}</TableCell>
              <TableCell className="text-right">
                {r.wins}-{r.losses}
              </TableCell>
              <TableCell className="text-right">{streakLabel(r.currentStreak)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DuoTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rankings', 'duo'],
    queryFn: rankingsApi.getDuo,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando ranking...</p>;
  if (isError) return <p className="text-sm text-destructive">No se pudo cargar el ranking.</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay partidos que afecten el ranking.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Dupla</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
            <TableHead className="text-right">V-D</TableHead>
            <TableHead className="text-right">Racha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium text-foreground">
                {r.duo.player1.nickname || r.duo.player1.name} / {r.duo.player2.nickname || r.duo.player2.name}
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">{r.points}</TableCell>
              <TableCell className="text-right">
                {r.wins}-{r.losses}
              </TableCell>
              <TableCell className="text-right">{streakLabel(r.currentStreak)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function RankingsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2 sm:mb-8">
        <Trophy className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Rankings</h1>
      </div>

      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="duplas">Duplas</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-4">
          <IndividualTable />
        </TabsContent>
        <TabsContent value="duplas" className="mt-4">
          <DuoTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
