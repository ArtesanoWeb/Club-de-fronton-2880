'use client';

import { Trophy, Users, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
            <Trophy className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-primary">
          Club de Frontón 2880
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Plataforma digital para la gestión competitiva y social del club
        </p>
        
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-accent" />
              <CardTitle className="text-lg">Jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conoce a los miembros del club y sus estadísticas
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-8 w-8 text-accent" />
              <CardTitle className="text-lg">Temporadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seguimiento de las temporadas y competencias
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Target className="mb-2 h-8 w-8 text-accent" />
              <CardTitle className="text-lg">Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Registro y resultados de los partidos played
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={() => window.location.href = '/jugadores'}>
            Ver Jugadores
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/temporadas'}>
            Ver Temporadas
          </Button>
        </div>
      </div>
    </div>
  );
}
