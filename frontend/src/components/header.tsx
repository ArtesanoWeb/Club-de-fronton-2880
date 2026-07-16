'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/user-menu';
import { Home, Users, Calendar, Trophy } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Trophy className="h-6 w-6 text-accent" />
            Frontón 2880
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/jugadores"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              Jugadores
            </Link>
            <Link
              href="/temporadas"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
              Temporadas
            </Link>
            <Link
              href="/partidos"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Partidos
            </Link>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}