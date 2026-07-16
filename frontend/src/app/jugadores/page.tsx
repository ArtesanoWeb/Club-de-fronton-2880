'use client';

import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { playersApi } from '@/lib/api/players';
import { PlayerCard } from '@/components/player-card';

export default function JugadoresPage() {
  const {
    data: players,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['players'],
    queryFn: playersApi.getPlayers,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2 sm:mb-8">
        <Users className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Jugadores</h1>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando jugadores...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          No se pudo cargar la lista de jugadores. Intenta de nuevo más tarde.
        </p>
      )}

      {players && players.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay jugadores registrados.</p>
      )}

      {players && players.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
