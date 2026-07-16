'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { RequireRole } from '@/components/require-role';
import { playersApi } from '@/lib/api/players';
import { seasonsApi } from '@/lib/api/seasons';
import { matchesApi, type RegistrableMatchModality, type MatchFormat } from '@/lib/api/matches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODALITY_LABELS: Record<RegistrableMatchModality, string> = {
  TEMPORADA_OFICIAL: 'Temporada Oficial',
  RETO: 'Reto',
  AMISTOSO: 'Amistoso',
};

const FORMAT_LABELS: Record<MatchFormat, string> = {
  BLITZ: 'Blitz (10 min · a 15 · 1 set)',
  CAMPEONATO: 'Campeonato (15 min/set · a 18 · mejor de 3)',
};

const setSchema = z.object({
  scoreA: z.string().regex(/^\d+$/, 'Debe ser un número'),
  scoreB: z.string().regex(/^\d+$/, 'Debe ser un número'),
});

const matchSchema = z
  .object({
    modality: z.enum(['TEMPORADA_OFICIAL', 'RETO', 'AMISTOSO']),
    format: z.enum(['BLITZ', 'CAMPEONATO']),
    seasonId: z.string().optional(),
    teamAPlayer1: z.string().min(1, 'Selecciona un jugador'),
    teamAPlayer2: z.string().min(1, 'Selecciona un jugador'),
    teamBPlayer1: z.string().min(1, 'Selecciona un jugador'),
    teamBPlayer2: z.string().min(1, 'Selecciona un jugador'),
    sets: z.array(setSchema).min(1).max(3),
    mvpPlayerId: z.string().optional(),
    durationMinutes: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const ids = [data.teamAPlayer1, data.teamAPlayer2, data.teamBPlayer1, data.teamBPlayer2];
    if (new Set(ids).size !== 4) {
      ctx.addIssue({
        code: 'custom',
        message: 'Los 4 jugadores deben ser distintos',
        path: ['teamBPlayer2'],
      });
    }
    if (data.modality === 'TEMPORADA_OFICIAL' && !data.seasonId) {
      ctx.addIssue({ code: 'custom', message: 'La temporada es obligatoria', path: ['seasonId'] });
    }
    if (data.format === 'BLITZ' && data.sets.length !== 1) {
      ctx.addIssue({ code: 'custom', message: 'Blitz siempre es a un solo set', path: ['sets'] });
    }
  });

type MatchFormData = z.infer<typeof matchSchema>;

function NuevoPartidoForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.getPlayers });
  const { data: seasons } = useQuery({ queryKey: ['seasons'], queryFn: seasonsApi.getSeasons });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      modality: 'AMISTOSO',
      format: 'BLITZ',
      sets: [{ scoreA: '0', scoreB: '0' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'sets' });

  const modality = watch('modality');
  const format = watch('format');
  const [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2, mvpPlayerId] = watch([
    'teamAPlayer1',
    'teamAPlayer2',
    'teamBPlayer1',
    'teamBPlayer2',
    'mvpPlayerId',
  ]);

  const selectedPlayerIds = [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2].filter(Boolean);

  useEffect(() => {
    if (format === 'BLITZ' && fields.length !== 1) {
      replace([{ scoreA: '0', scoreB: '0' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  useEffect(() => {
    if (!dirtyFields.durationMinutes) {
      setValue('durationMinutes', format === 'BLITZ' ? '10' : '15');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  useEffect(() => {
    if (mvpPlayerId && !selectedPlayerIds.includes(mvpPlayerId)) {
      setValue('mvpPlayerId', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2]);

  const createMutation = useMutation({
    mutationFn: matchesApi.createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Partido registrado');
      router.push('/partidos');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al registrar el partido'),
  });

  const onSubmit = (data: MatchFormData) => {
    createMutation.mutate({
      seasonId: data.modality === 'TEMPORADA_OFICIAL' ? data.seasonId : undefined,
      modality: data.modality,
      format: data.format,
      teamA: [data.teamAPlayer1, data.teamAPlayer2],
      teamB: [data.teamBPlayer1, data.teamBPlayer2],
      sets: data.sets.map((s) => ({ scoreA: Number(s.scoreA), scoreB: Number(s.scoreB) })),
      mvpPlayerId: data.mvpPlayerId || undefined,
      durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined,
      notes: data.notes || undefined,
    });
  };

  const playerOptions = players ?? [];

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary sm:text-2xl">Registrar Partido</CardTitle>
          <CardDescription>Cargá el resultado de un partido jugado.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modalidad</label>
                <Controller
                  control={control}
                  name="modality"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: RegistrableMatchModality | null) =>
                            value ? MODALITY_LABELS[value] : 'Selecciona'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(MODALITY_LABELS) as RegistrableMatchModality[]).map((m) => (
                          <SelectItem key={m} value={m}>
                            {MODALITY_LABELS[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato</label>
                <Controller
                  control={control}
                  name="format"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: MatchFormat | null) => (value ? FORMAT_LABELS[value] : 'Selecciona')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FORMAT_LABELS) as MatchFormat[]).map((f) => (
                          <SelectItem key={f} value={f}>
                            {FORMAT_LABELS[f]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {modality === 'TEMPORADA_OFICIAL' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporada</label>
                <Controller
                  control={control}
                  name="seasonId"
                  render={({ field }) => (
                    <Select value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string | null) =>
                            (seasons ?? []).find((s) => s.id === value)?.name ?? 'Selecciona una temporada'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(seasons ?? []).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.seasonId && <p className="text-sm text-destructive">{errors.seasonId.message}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Equipo A</p>
                {(['teamAPlayer1', 'teamAPlayer2'] as const).map((name) => (
                  <Controller
                    key={name}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Select value={field.value ?? null} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: string | null) => {
                              const p = playerOptions.find((pl) => pl.id === value);
                              return p ? p.nickname || p.name : 'Selecciona un jugador';
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {playerOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nickname || p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Equipo B</p>
                {(['teamBPlayer1', 'teamBPlayer2'] as const).map((name) => (
                  <Controller
                    key={name}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Select value={field.value ?? null} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: string | null) => {
                              const p = playerOptions.find((pl) => pl.id === value);
                              return p ? p.nickname || p.name : 'Selecciona un jugador';
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {playerOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nickname || p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ))}
              </div>
            </div>
            {errors.teamBPlayer2 && (
              <p className="text-sm text-destructive">{errors.teamBPlayer2.message}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sets</label>
                {format === 'CAMPEONATO' && fields.length < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ scoreA: '0', scoreB: '0' })}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar set
                  </Button>
                )}
              </div>
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <span className="w-14 text-xs text-muted-foreground">Set {i + 1}</span>
                  <Input type="number" min={0} {...register(`sets.${i}.scoreA` as const)} />
                  <span className="text-muted-foreground">-</span>
                  <Input type="number" min={0} {...register(`sets.${i}.scoreB` as const)} />
                  {i > 0 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.sets && <p className="text-sm text-destructive">{errors.sets.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">MVP (opcional)</label>
              <Controller
                control={control}
                name="mvpPlayerId"
                render={({ field }) => (
                  <Select value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string | null) => {
                          const p = playerOptions.find((pl) => pl.id === value);
                          return p ? p.nickname || p.name : 'Sin MVP';
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {playerOptions
                        .filter((p) => selectedPlayerIds.includes(p.id))
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nickname || p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="durationMinutes" className="text-sm font-medium">
                  Duración (min)
                </label>
                <Input id="durationMinutes" type="number" min={1} {...register('durationMinutes')} />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notas
                </label>
                <Input id="notes" {...register('notes')} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar partido'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function NuevoPartidoPage() {
  return (
    <RequireRole>
      <NuevoPartidoForm />
    </RequireRole>
  );
}
