'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { LogOut, User, Shield } from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, clearSession } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores - limpiar sesión de todos modos
    } finally {
      clearSession();
      toast.success('Sesión cerrada');
      router.push('/');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => window.location.href = '/login'}>
          Iniciar Sesión
        </Button>
        <Button onClick={() => window.location.href = '/register'}>
          Registrarse
        </Button>
      </div>
    );
  }

  const initials = user.player?.name
    ? user.player.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">
            {user.player?.name || user.email}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
          {user.player?.nickname && (
            <p className="text-xs leading-none text-muted-foreground">
              @{user.player.nickname}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/dashboard/perfil'} className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>
        {user.role === 'ADMIN' && (
          <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}