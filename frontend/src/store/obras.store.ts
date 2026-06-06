import { create } from 'zustand'
import { api } from '../lib/api'

export interface Obra {
  id: string; name: string; address: string | null; status: string
  budgetPlanned: number | null; budgetRealized: number
  startDate: string | null; endDate: string | null
  contract?: { title: string }
  _count?: { steps: number; custos: number; purchaseOrders: number }
}

interface Store {
  obras: Obra[]; loading: boolean
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: unknown) => Promise<Obra>
  update: (id: string, data: unknown) => Promise<Obra>
}

export const useObrasStore = create<Store>(set => ({
  obras: [], loading: false,
  fetch: async (params) => {
    set({ loading: true })
    const { data } = await api.get('/obras', { params })
    set({ obras: data, loading: false })
  },
  create: async (payload) => {
    const { data } = await api.post('/obras', payload)
    set(s => ({ obras: [data, ...s.obras] }))
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/obras/${id}`, payload)
    set(s => ({ obras: s.obras.map(o => o.id === id ? data : o) }))
    return data
  },
}))
