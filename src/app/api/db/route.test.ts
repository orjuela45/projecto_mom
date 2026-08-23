import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }))
vi.mock('pg', () => ({ Pool: class { query = queryMock } }))

import { POST } from './route'

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const lastSql = () => norm(queryMock.mock.calls[0][0] as string)
const lastParams = () => queryMock.mock.calls[0][1] as any[]

function makeReq(body: unknown) {
  return new NextRequest('http://localhost:3000/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/db', () => {
  beforeEach(() => {
    queryMock.mockReset()
    queryMock.mockResolvedValue({ rows: [] })
  })

  describe('select', () => {
    it('selects with order and limit', async () => {
      queryMock.mockResolvedValue({ rows: [{ name: 'Cardiology' }] })
      const res = await POST(
        makeReq({
          table: 'specialties',
          operation: 'select',
          order: { col: 'name', asc: true },
          limit: 5,
        })
      )
      expect(res.status).toBe(200)
      expect(lastSql()).toBe('SELECT * FROM specialties ORDER BY name ASC LIMIT 5')
      expect(await res.json()).toEqual({ data: [{ name: 'Cardiology' }], error: null })
    })

    it('builds WHERE from eq filters', async () => {
      await POST(
        makeReq({
          table: 'appointments',
          operation: 'select',
          filters: [
            { col: 'status', op: 'eq', value: 'pending' },
            { col: 'patient_id', op: 'eq', value: 'p-1' },
          ],
        })
      )
      expect(lastSql()).toBe('SELECT * FROM appointments WHERE status = $1 AND patient_id = $2')
      expect(lastParams()).toEqual(['pending', 'p-1'])
    })

    it('maps is(null) to IS NULL and not-null to IS NOT NULL', async () => {
      await POST(
        makeReq({
          table: 'appointments',
          operation: 'select',
          filters: [
            { col: 'date', op: 'is', value: null },
            { col: 'notes', op: 'not', value: null },
          ],
        })
      )
      expect(lastSql()).toBe('SELECT * FROM appointments WHERE date IS NULL AND notes IS NOT NULL')
      expect(lastParams()).toEqual([])
    })

    it('single returns the first row or null', async () => {
      queryMock.mockResolvedValue({ rows: [] })
      const res = await POST(
        makeReq({ table: 'patients', operation: 'select', single: true })
      )
      expect(await res.json()).toEqual({ data: null, error: null })
    })
  })

  describe('insert', () => {
    it('inserts and returns the created row', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: '1', name: 'Ana' }] })
      const res = await POST(
        makeReq({
          table: 'patients',
          operation: 'insert',
          data: { name: 'Ana', phone: '123' },
        })
      )
      expect(res.status).toBe(200)
      expect(lastSql()).toBe('INSERT INTO patients (name, phone) VALUES ($1, $2) RETURNING *')
      expect(lastParams()).toEqual(['Ana', '123'])
      expect(await res.json()).toEqual({ data: { id: '1', name: 'Ana' }, error: null })
    })
  })

  describe('update', () => {
    it('offsets filter params after the SET params', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: 'abc', name: 'Ana' }] })
      const res = await POST(
        makeReq({
          table: 'patients',
          operation: 'update',
          data: { set: { name: 'Ana' }, filters: [{ col: 'id', op: 'eq', value: 'abc' }] },
        })
      )
      expect(res.status).toBe(200)
      expect(lastSql()).toBe('UPDATE patients SET name = $1 WHERE id = $2 RETURNING *')
      expect(lastParams()).toEqual(['Ana', 'abc'])
      expect(await res.json()).toEqual({ data: [{ id: 'abc', name: 'Ana' }], error: null })
    })
  })

  describe('delete', () => {
    it('deletes with filters and returns deleted rows', async () => {
      queryMock.mockResolvedValue({ rows: [{ id: 'abc' }] })
      const res = await POST(
        makeReq({
          table: 'patients',
          operation: 'delete',
          filters: [{ col: 'id', op: 'eq', value: 'abc' }],
        })
      )
      expect(res.status).toBe(200)
      expect(lastSql()).toBe('DELETE FROM patients WHERE id = $1 RETURNING *')
      expect(lastParams()).toEqual(['abc'])
      expect(await res.json()).toEqual({ data: [{ id: 'abc' }], error: null })
    })
  })

  describe('error handling', () => {
    it('rejects unknown operations with 400', async () => {
      const res = await POST(makeReq({ table: 'patients', operation: 'upsert' }))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'Unknown operation' })
    })

    it('returns 500 with the db error message', async () => {
      queryMock.mockRejectedValue(new Error('relation "nope" does not exist'))
      const res = await POST(makeReq({ table: 'nope', operation: 'select' }))
      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({
        data: null,
        error: { message: 'relation "nope" does not exist' },
      })
    })
  })
})
