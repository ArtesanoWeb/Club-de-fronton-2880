'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { RequireRole } from '@/components/require-role';
import { seasonsApi, type Season } from '@/lib/api/seasons';
import { SeasonStatusBadge } from '@/components/season-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const seasonSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'FINISHED']),
});

type SeasonFormData = z.infer<typeof seasonSchema>;

const STATUS_LABELS: Record<SeasonFormData['status'], string> = {
  UPCOMING: 'Próxima',
  ACTIVE: 'Activa',
  FINISHED: 'Finalizada',
};

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : '';
}

function AdminTemporadasContent() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const {
    data: seasons,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['seasons'],
    queryFn: seasonsApi.getSeasons,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeasonFormData>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { status: 'UPCOMING' },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['seasons'] });

  const createMutation = useMutation({
    mutationFn: seasonsApi.createSeason,
    onSuccess: () => {
      invalidate();
      toast.success('Temporada creada');
      setDialogOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear la temporada'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SeasonFormData }) => seasonsApi.updateSeason(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Temporada actualizada');
      setDialogOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar la temporada'),
  });

  const deleteMutation = useMutation({
    mutationFn: seasonsApi.deleteSeason,
    onSuccess: () => {
      invalidate();
      toast.success('Temporada eliminada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar la temporada'),
  });

  const openCreateDialog = () => {
    setEditingSeason(null);
    reset({ name: '', startDate: '', endDate: '', status: 'UPCOMING' });
    setDialogOpen(true);
  };

  const openEditDialog = (season: Season) => {
    setEditingSeason(season);
    reset({
      name: season.name,
      startDate: toDateInputValue(season.startDate),
      endDate: toDateInputValue(season.endDate),
      status: season.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: SeasonFormData) => {
    const payload = { ...data, endDate: data.endDate || undefined };
    if (editingSeason) {
      updateMutation.mutate({ id: editingSeason.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (season: Season) => {
    if (window.confirm(`¿Eliminar la temporada "${season.name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(season.id);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Administrar Temporadas</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Nueva Temporada
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando temporadas...</p>}
      {isError && <p className="text-sm text-destructive">No se pudo cargar la lista de temporadas.</p>}
      {seasons && seasons.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay temporadas creadas.</p>
      )}

      {seasons && seasons.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((season) => (
                <TableRow key={season.id}>
                  <TableCell className="font-medium text-foreground">{season.name}</TableCell>
                  <TableCell>{toDateInputValue(season.startDate)}</TableCell>
                  <TableCell>{season.endDate ? toDateInputValue(season.endDate) : '—'}</TableCell>
                  <TableCell>
                    <SeasonStatusBadge status={season.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(season)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(season)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingSeason ? 'Editar Temporada' : 'Nueva Temporada'}</DialogTitle>
              <DialogDescription>
                {editingSeason ? 'Actualiza los datos de la temporada.' : 'Completa los datos de la nueva temporada.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </label>
                <Input id="name" placeholder="Ej. Apertura 2026" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Fecha de inicio
                  </label>
                  <Input id="startDate" type="date" {...register('startDate')} />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    Fecha de fin
                  </label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: SeasonFormData['status'] | null) =>
                            value ? STATUS_LABELS[value] : 'Selecciona una opción'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as SeasonFormData['status'][]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {editingSeason ? 'Guardar cambios' : 'Crear temporada'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminTemporadasPage() {
  return (
    <RequireRole>
      <AdminTemporadasContent />
    </RequireRole>
  );
}
