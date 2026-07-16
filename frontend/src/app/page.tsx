'use client';

import { Trophy, Users, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary sm:h-20 sm:w-20 md:h-24 md:w-24">
            <Trophy className="h-8 w-8 text-primary-foreground sm:h-10 sm:w-10 md:h-12 md:w-12" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-primary sm:mb-4 sm:text-3xl md:text-4xl">
          Club de Frontón 2880
        </h1>
        <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base md:text-lg">
          Plataforma digital para la gestión competitiva y social del club
        </p>
        
        <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <Users className="mb-1 h-6 w-6 text-accent sm:mb-2 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              <CardTitle className="text-base sm:text-lg">Jugadores</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Conoce a los miembros del club y sus estadísticas
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <Calendar className="mb-1 h-6 w-6 text-accent sm:mb-2 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              <CardTitle className="text-base sm:text-lg">Temporadas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Seguimiento de las temporadas y competencias
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <Target className="mb-1 h-6 w-6 text-accent sm:mb-2 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              <CardTitle className="text-base sm:text-lg">Partidos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Registro y resultados de los partidos jugados
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button className="h-9 sm:h-10" size="lg" onClick={() => window.location.href = '/jugadores'}>
            Ver Jugadores
          </Button>
          <Button variant="outline" className="h-9 sm:h-10" size="lg" onClick={() => window.location.href = '/temporadas'}>
            Ver Temporadas
          </Button>
        </div>
      </div>
    </div>
  );
}
