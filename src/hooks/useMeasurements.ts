import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Measurement, MeasurementType } from '../types'

interface MeasurementFilters {
  type?: MeasurementType
  from?: string
  to?: string
}

export function useMeasurements(childId: string, filters: MeasurementFilters = {}) {
  return useQuery<Measurement[]>({
    queryKey: ['measurements', childId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.type) params.set('type', filters.type)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const { data } = await api.get(
        `/children/${childId}/measurements?${params.toString()}`
      )
      return data.data
    },
    enabled: !!childId,
  })
}

export function useAddMeasurement(childId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      type: MeasurementType
      value: number
      date: string
      unit?: string
    }) => {
      const { data } = await api.post(`/children/${childId}/measurements`, payload)
      return data.data as Measurement
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['measurements', childId] }),
  })
}

export function useDeleteMeasurement(childId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (measurementId: string) => {
      await api.delete(`/measurements/${measurementId}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['measurements', childId] }),
  })
}
