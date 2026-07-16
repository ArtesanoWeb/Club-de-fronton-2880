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

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      setSession(response.user, response.accessToken, response.refreshToken);
      toast.success('Inicio de sesión exitoso');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1 pb-4 sm:space-y-2 sm:pb-6">
          <CardTitle className="text-xl font-bold text-primary sm:text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ingresa a tu cuenta del Club de Frontón 2880
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-3 sm:space-y-4">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2 sm:gap-4 sm:pt-4">
            <Button type="submit" className="h-9 w-full sm:h-10" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
            <p className="text-xs text-muted-foreground sm:text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}