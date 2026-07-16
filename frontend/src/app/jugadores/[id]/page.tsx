'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { playersApi } from '@/lib/api/players';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function JugadorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    data: player,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['players', id],
    queryFn: () => playersApi.getPlayer(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Cargando jugador...</p>
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <p className="text-sm text-destructive">Jugador no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            {player.photoUrl && <AvatarImage src={player.photoUrl} alt={player.name} />}
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl text-primary">{player.name}</CardTitle>
            {player.nickname && <p className="text-muted-foreground">@{player.nickname}</p>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {player.ranking ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-4 text-center">
              <div>
                <p className="text-xl font-bold text-primary">{player.ranking.points}</p>
                <p className="text-xs text-muted-foreground">Puntos</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">
                  {player.ranking.wins}-{player.ranking.losses}
                </p>
                <p className="text-xs text-muted-foreground">V-D</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{player.ranking.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Racha</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin partidos registrados todavía.</p>
          )}

          {(player.dominantHand || player.playStyle) && (
            <div className="flex flex-wrap gap-2">
              {player.dominantHand && (
                <Badge variant="outline">
                  {player.dominantHand === 'RIGHT' ? 'Diestro' : 'Zurdo'}
                </Badge>
              )}
              {player.playStyle && <Badge variant="outline">{player.playStyle}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
