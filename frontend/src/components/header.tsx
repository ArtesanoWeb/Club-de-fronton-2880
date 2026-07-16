'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from '@/components/user-menu';
import { Home, Users, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-primary sm:text-lg">
            <Image
              src="/brand/logo.png"
              alt="Club de Frontón 2880"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
              priority
            />
            <span className="hidden xs:inline">Frontón 2880</span>
            <span className="xs:hidden">2880</span>
          </Link>
          <nav className="hidden items-center gap-3 md:flex lg:gap-4">
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
        
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/jugadores"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              Jugadores
            </Link>
            <Link
              href="/temporadas"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              Temporadas
            </Link>
            <Link
              href="/partidos"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Partidos
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}