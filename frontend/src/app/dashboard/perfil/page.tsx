'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RequireAuth } from '@/components/require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { playersApi } from '@/lib/api/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nickname: z.string().optional(),
  photoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  dominantHand: z.enum(['LEFT', 'RIGHT']).optional(),
  playStyle: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function PerfilForm() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setSession = useAuthStore((state) => state.setSession);

  const playerId = user?.player?.id;

  const { data: player, isLoading } = useQuery({
    queryKey: ['players', playerId],
    queryFn: () => playersApi.getPlayer(playerId!),
    enabled: !!playerId,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (player) {
      reset({
        name: player.name,
        nickname: player.nickname || '',
        photoUrl: player.photoUrl || '',
        dominantHand: player.dominantHand ?? undefined,
        playStyle: player.playStyle || '',
      });
    }
  }, [player, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updated = await playersApi.updateMe({
        name: data.name,
        nickname: data.nickname || undefined,
        photoUrl: data.photoUrl || undefined,
        dominantHand: data.dominantHand,
        playStyle: data.playStyle || undefined,
      });
      if (user && accessToken && refreshToken) {
        setSession({ ...user, player: { ...user.player, ...updated } }, accessToken, refreshToken);
      }
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando perfil...</p>;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary sm:text-2xl">Mi Perfil</CardTitle>
        <CardDescription>Actualiza tu información como jugador</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre completo
            </label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              Nickname
            </label>
            <Input id="nickname" {...register('nickname')} />
          </div>

          <div className="space-y-2">
            <label htmlFor="photoUrl" className="text-sm font-medium">
              Foto (URL)
            </label>
            <Input id="photoUrl" placeholder="https://..." {...register('photoUrl')} />
            {errors.photoUrl && (
              <p className="text-sm text-destructive">{errors.photoUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mano dominante</label>
            <Controller
              control={control}
              name="dominantHand"
              render={({ field }) => (
                <Select value={field.value ?? null} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RIGHT">Diestro</SelectItem>
                    <SelectItem value="LEFT">Zurdo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="playStyle" className="text-sm font-medium">
              Estilo de juego
            </label>
            <Input id="playStyle" placeholder="Ej. Ofensivo, defensivo..." {...register('playStyle')} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function PerfilPage() {
  return (
    <RequireAuth>
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <PerfilForm />
      </div>
    </RequireAuth>
  );
}
