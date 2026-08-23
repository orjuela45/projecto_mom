import { describe, it, expect, vi, beforeEach } from 'vitest'

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }))
vi.mock('pg', () => ({ Pool: class { query = queryMock } }))

import { from } from './db'

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const lastSql = () => norm(queryMock.mock.calls[0][0] as string)
const lastParams = () => queryMock.mock.calls[0][1] as any[]

describe('db QueryBuilder (server)', () => {
  beforeEach(() => {
    queryMock.mockReset()
    queryMock.mockResolvedValue({ rows: [] })
  })

  describe('select', () => {
    it('selects all rows without filters', async () => {
      const { data, error } = await from('patients')
      expect(error).toBeNull()
      expect(lastSql()).toBe('SELECT * FROM patients')
      expect(lastParams()).toEqual([])
      expect(data).toEqual([])
    })

    it('builds WHERE with eq, ORDER BY and LIMIT', async () => {
      await from('appointments')
        .select('id, date')
        .eq('status', 'pending')
        .order('date', { ascending: false })
        .limit(10)
      expect(lastSql()).toBe(
        'SELECT id, date FROM appointments WHERE status = $1 ORDER BY date DESC LIMIT 10'
      )
      expect(lastParams()).toEqual(['pending'])
    })

    it('combines eq and neq filters with sequential params', async () => {
      await from('appointments').eq('status', 'pending').neq('specialty_id', 'x-1')
      expect(lastSql()).toBe(
        'SELECT * FROM appointments WHERE status = $1 AND specialty_id != $2'
      )
      expect(lastParams()).toEqual(['pending', 'x-1'])
    })

    it('maps is(null) to IS NULL and is(false) to IS NOT NULL', async () => {
      await from('patients').is('deleted_at', null)
      expect(lastSql()).toBe('SELECT * FROM patients WHERE deleted_at IS NULL')
      expect(lastParams()).toEqual([])

      queryMock.mockClear()
      await from('patients').is('deleted_at', false)
      expect(lastSql()).toBe('SELECT * FROM patients WHERE deleted_at IS NOT NULL')
      expect(lastParams()).toEqual([])
    })

    it('maps not(col, is, null) to IS NOT NULL', async () => {
      await from('appointments').not('date', 'is', null)
      expect(lastSql()).toBe('SELECT * FROM appointments WHERE date IS NOT NULL')
      expect(lastParams()).toEqual([])
    })

    it('single() returns the first row and forces LIMIT 1', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: '1', name: 'Ana' }] })
      const { data } = await from('patients').eq('id', '1').single()
      expect(lastSql()).toContain('LIMIT 1')
      expect(data).toEqual({ id: '1', name: 'Ana' })
    })

    it('single() returns null when there are no rows', async () => {
      const { data, error } = await from('patients').eq('id', 'nope').single()
      expect(data).toBeNull()
      expect(error).toBeNull()
    })
  })

  describe('insert', () => {
    it('builds INSERT with positional placeholders and returns the row', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: '1', name: 'Ana', phone: '123' }] })
      const { data, error } = await from('patients').insert({ name: 'Ana', phone: '123' })
      expect(error).toBeNull()
      expect(lastSql()).toBe('INSERT INTO patients (name, phone) VALUES ($1, $2) RETURNING *')
      expect(lastParams()).toEqual(['Ana', '123'])
      expect(data).toEqual({ id: '1', name: 'Ana', phone: '123' })
    })
  })

  describe('update', () => {
    it('offsets filter params after the SET params', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: 'abc', name: 'Ana' }] })
      const { data, error } = await from('patients')
        .update({ name: 'Ana' })
        .eq('id', 'abc')
      expect(error).toBeNull()
      expect(lastSql()).toBe('UPDATE patients SET name = $1 WHERE id = $2 RETURNING *')
      expect(lastParams()).toEqual(['Ana', 'abc'])
      expect(data).toEqual([{ id: 'abc', name: 'Ana' }])
    })

    it('handles multiple SET columns and multiple filters', async () => {
      queryMock.mockResolvedValue({ rows: [] })
      await from('appointments')
        .update({ status: 'completed', notes: 'ok' })
        .eq('id', 'c-1')
        .eq('created_by', 'u-1')
      expect(lastSql()).toBe(
        'UPDATE appointments SET status = $1, notes = $2 WHERE id = $3 AND created_by = $4 RETURNING *'
      )
      expect(lastParams()).toEqual(['completed', 'ok', 'c-1', 'u-1'])
    })

    it('single() returns the updated row', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: 'abc', name: 'Ana' }] })
      const { data } = await from('patients').update({ name: 'Ana' }).eq('id', 'abc').single()
      expect(data).toEqual({ id: 'abc', name: 'Ana' })
    })
  })

  describe('delete', () => {
    it('builds DELETE with WHERE and returns deleted rows', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: 'abc' }] })
      const { data, error } = await from('patients').delete().eq('id', 'abc')
      expect(error).toBeNull()
      expect(lastSql()).toBe('DELETE FROM patients WHERE id = $1 RETURNING *')
      expect(lastParams()).toEqual(['abc'])
      expect(data).toEqual([{ id: 'abc' }])
    })
  })

  describe('error handling', () => {
    it('returns the error instead of throwing', async () => {
      queryMock.mockRejectedValue(new Error('connection refused'))
      const { data, error } = await from('patients')
      expect(data).toBeNull()
      expect(error).toEqual({ message: 'connection refused' })
    })
  })
})
