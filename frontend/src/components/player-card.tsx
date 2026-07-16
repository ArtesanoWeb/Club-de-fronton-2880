'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Player } from '@/lib/api/players';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link href={`/jugadores/${player.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardContent className="flex flex-col items-center gap-3 p-4 text-center sm:p-6">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
            {player.photoUrl && <AvatarImage src={player.photoUrl} alt={player.name} />}
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{player.name}</p>
            {player.nickname && (
              <p className="text-sm text-muted-foreground">@{player.nickname}</p>
            )}
          </div>
          {player.ranking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{player.ranking.points} pts</Badge>
              <span>
                {player.ranking.wins}V - {player.ranking.losses}D
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
