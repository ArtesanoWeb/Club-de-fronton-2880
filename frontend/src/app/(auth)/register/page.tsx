'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth-store';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  nickname: z.string().optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        nickname: data.nickname,
        password: data.password,
      };
      const response = await authApi.register(payload);
      setSession(response.user, response.accessToken, response.refreshToken);
      toast.success('Registro exitoso');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1 pb-4 sm:space-y-2 sm:pb-6">
          <CardTitle className="text-xl font-bold text-primary sm:text-2xl">Crear Cuenta</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Únete al Club de Frontón 2880
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="name" className="text-xs font-medium sm:text-sm">
                Nombre completo
              </label>
              <Input
                id="name"
                placeholder="Tu nombre"
                className="h-9 sm:h-10"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive sm:text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="text-xs font-medium sm:text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="h-9 sm:h-10"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive sm:text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="nickname" className="text-xs font-medium sm:text-sm">
                Nickname (opcional)
              </label>
              <Input
                id="nickname"
                placeholder="Tu apodo en la cancha"
                className="h-9 sm:h-10"
                {...register('nickname')}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="text-xs font-medium sm:text-sm">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-9 sm:h-10"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive sm:text-sm">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-medium sm:text-sm">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-9 sm:h-10"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive sm:text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2 sm:gap-4 sm:pt-4">
            <Button type="submit" className="h-9 w-full sm:h-10" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <p className="text-xs text-muted-foreground sm:text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}