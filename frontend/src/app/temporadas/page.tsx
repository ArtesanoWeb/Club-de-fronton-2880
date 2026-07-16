'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { seasonsApi } from '@/lib/api/seasons';
import { SeasonStatusBadge } from '@/components/season-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function TemporadasPage() {
  const {
    data: seasons,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['seasons'],
    queryFn: seasonsApi.getSeasons,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2 sm:mb-8">
        <Calendar className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Temporadas</h1>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando temporadas...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          No se pudo cargar la lista de temporadas. Intenta de nuevo más tarde.
        </p>
      )}

      {seasons && seasons.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay temporadas creadas.</p>
      )}

      {seasons && seasons.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((season) => (
                <TableRow key={season.id} className="cursor-pointer">
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/temporadas/${season.id}`} className="hover:underline">
                      {season.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(season.startDate)}</TableCell>
                  <TableCell>{season.endDate ? formatDate(season.endDate) : '—'}</TableCell>
                  <TableCell>
                    <SeasonStatusBadge status={season.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
