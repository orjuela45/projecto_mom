import { describe, it, expect, vi, beforeEach } from 'vitest'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import { from, createClient } from './db-client'

const lastBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string)

describe('db-client ClientQueryBuilder (browser)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ json: async () => ({ data: [], error: null }) })
  })

  it('sends a select payload to /api/db', async () => {
    const { data, error } = await from('patients').eq('id', '1').single()
    expect(error).toBeNull()
    expect(data).toEqual([])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/db')
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(lastBody()).toEqual({
      table: 'patients',
      select: '*',
      filters: [{ col: 'id', op: 'eq', value: '1' }],
      order: null,
      limit: 1,
      single: true,
      operation: 'select',
      data: undefined,
    })
  })

  it('sends select columns and order', async () => {
    await from('appointments').select('id, date').order('date', { ascending: false }).limit(10)
    expect(lastBody()).toMatchObject({
      table: 'appointments',
      select: 'id, date',
      order: { col: 'date', asc: false },
      limit: 10,
      operation: 'select',
    })
  })

  it('sends an insert payload', async () => {
    await from('patients').insert({ name: 'Ana' })
    expect(lastBody()).toMatchObject({
      table: 'patients',
      operation: 'insert',
      data: { name: 'Ana' },
    })
  })

  it('sends an update payload with set and filters', async () => {
    await from('patients').update({ name: 'Ana' }).eq('id', 'abc')
    expect(lastBody()).toMatchObject({
      table: 'patients',
      operation: 'update',
      data: { set: { name: 'Ana' }, filters: [{ col: 'id', op: 'eq', value: 'abc' }] },
    })
  })

  it('sends a delete payload with filters', async () => {
    await from('patients').delete().eq('id', 'abc')
    expect(lastBody()).toMatchObject({
      table: 'patients',
      operation: 'delete',
      filters: [{ col: 'id', op: 'eq', value: 'abc' }],
    })
  })

  it('returns an error object when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))
    const { data, error } = await from('patients')
    expect(data).toBeNull()
    expect(error).toEqual({ message: 'network down' })
  })

  it('createClient exposes auth with the default user', async () => {
    const client = createClient()
    const { data } = await client.auth.getUser()
    expect(data.user).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@momcitas.com',
    })
  })
})
