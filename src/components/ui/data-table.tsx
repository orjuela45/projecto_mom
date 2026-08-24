'use client'

import { useState, ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Pencil, Trash2, Inbox } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  searchKey: keyof T
  searchPlaceholder?: string
  addButtonText: string
  emptyMessage?: string
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  deleteConfirmTitle?: string
  deleteConfirmDescription?: (item: T) => string
}

export function DataTable<T extends { id: string; name?: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Buscar...',
  addButtonText,
  emptyMessage = 'No hay registros',
  onAdd,
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Eliminar registro',
  deleteConfirmDescription = (item) => `¿Estás seguro de eliminar "${item.name || 'este registro'}"? Esta acción no se puede deshacer.`,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [deletingItem, setDeletingItem] = useState<T | null>(null)

  const filteredData = data.filter(item => {
    const value = item[searchKey]
    if (typeof value === 'string') {
      return value.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  function handleDelete() {
    if (deletingItem) {
      onDelete(deletingItem)
      setDeletingItem(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header: Search + Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {addButtonText}
        </Button>
      </div>

      {/* Results count */}
      {search && filteredData.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredData.length} {filteredData.length === 1 ? 'resultado' : 'resultados'}
        </p>
      )}

      {/* Table or Empty State */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {search ? 'Sin resultados' : 'Sin registros'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search
              ? `No se encontraron resultados para "${search}"`
              : emptyMessage}
          </p>
          {!search && (
            <Button onClick={onAdd} variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="group">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? '-')}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem && deleteConfirmDescription(deletingItem)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
