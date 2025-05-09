'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  newTimestamp: z.date({
    required_error: 'Selecione a data e hora correta',
  }),
  reason: z.string().min(10, 'A justificativa deve ter no mínimo 10 caracteres'),
  evidence: z.string().optional(),
})

interface CorrectionRequestFormProps {
  timeRecord: {
    id: string
    type: 'ENTRY' | 'EXIT'
    timestamp: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function CorrectionRequestForm({
  timeRecord,
  onSuccess,
  onCancel,
}: CorrectionRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      evidence: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const response = await fetch('/api/time-record/correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRecordId: timeRecord.id,
          newTimestamp: values.newTimestamp.toISOString(),
          reason: values.reason,
          evidence: values.evidence,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao solicitar correção')
      }

      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de correção foi enviada com sucesso.',
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a solicitação de correção.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newTimestamp"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Nova data e hora</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP HH:mm', { locale: ptBR })
                      ) : (
                        <span>Selecione a data e hora</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const newDate = new Date(field.value || new Date())
                        newDate.setHours(parseInt(hours))
                        newDate.setMinutes(parseInt(minutes))
                        field.onChange(newDate)
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificativa</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o motivo da correção..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evidência (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        field.onChange(reader.result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Solicitar Correção'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 