import { create } from 'zustand'
import { api } from '../lib/api'

export interface Contract {
  id: string; title: string; type: string; status: string
  partyName: string; value: number | null; startDate: string | null
  endDate: string | null; createdAt: string
  template?: { name: string }; _count?: { signatureRequests: number }
}

interface Store {
  contracts: Contract[]; loading: boolean
  fetch: (params?: Record<string, string>) => Promise<void>
  create: (data: unknown) => Promise<Contract>
  update: (id: string, data: unknown) => Promise<Contract>
  remove: (id: string) => Promise<void>
}

export const useContractsStore = create<Store>(set => ({
  contracts: [], loading: false,
  fetch: async (params) => {
    set({ loading: true })
    const { data } = await api.get('/contracts', { params })
    set({ contracts: data, loading: false })
  },
  create: async (payload) => {
    const { data } = await api.post('/contracts', payload)
    set(s => ({ contracts: [data, ...s.contracts] }))
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/contracts/${id}`, payload)
    set(s => ({ contracts: s.contracts.map(c => c.id === id ? data : c) }))
    return data
  },
  remove: async (id) => {
    await api.delete(`/contracts/${id}`)
    set(s => ({ contracts: s.contracts.filter(c => c.id !== id) }))
  },
}))
