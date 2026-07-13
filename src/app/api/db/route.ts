import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { table, operation, data, filters, select, order, limit, single } = body

  try {
    if (operation === 'select') {
      let sql = `SELECT ${select || '*'} FROM ${table}`
      const params: any[] = []
      let paramIndex = 1

      if (filters) {
        const whereClauses: string[] = []
        for (const f of filters) {
          if (f.op === 'is' && f.value === null) {
            whereClauses.push(`${f.col} IS NULL`)
          } else if (f.op === 'is' && f.value === false) {
            whereClauses.push(`${f.col} IS NOT NULL`)
          } else if (f.op === 'eq') {
            whereClauses.push(`${f.col} = $${paramIndex}`)
            params.push(f.value)
            paramIndex++
          } else if (f.op === 'neq') {
            whereClauses.push(`${f.col} != $${paramIndex}`)
            params.push(f.value)
            paramIndex++
          } else if (f.op === 'not' && f.value === null) {
            whereClauses.push(`${f.col} IS NOT NULL`)
          }
        }
        if (whereClauses.length) sql += ` WHERE ${whereClauses.join(' AND ')}`
      }

      if (order) sql += ` ORDER BY ${order.col} ${order.asc ? 'ASC' : 'DESC'}`
      if (limit) sql += ` LIMIT ${limit}`

      const result = await pool.query(sql, params)
      const rows = single ? result.rows[0] || null : result.rows
      return NextResponse.json({ data: rows, error: null })
    }

    if (operation === 'insert') {
      const cols = Object.keys(data)
      const vals = Object.values(data)
      const placeholders = cols.map((_, i) => `$${i + 1}`)
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const result = await pool.query(sql, vals)
      return NextResponse.json({ data: result.rows[0], error: null })
    }

    if (operation === 'update') {
      const { set, filters: updateFilters } = data
      const cols = Object.keys(set)
      const vals = Object.values(set)
      const setClauses = cols.map((col, i) => `${col} = $${i + 1}`)
      let paramIndex = cols.length + 1
      const whereClauses: string[] = []

      if (updateFilters) {
        for (const f of updateFilters) {
          if (f.op === 'eq') {
            whereClauses.push(`${f.col} = $${paramIndex}`)
            params: vals.push(f.value)
            paramIndex++
          }
        }
      }

      const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
      const sql = `UPDATE ${table} SET ${setClauses.join(', ')} ${where} RETURNING *`
      const result = await pool.query(sql, vals)
      const rows = single ? result.rows[0] || null : result.rows
      return NextResponse.json({ data: rows, error: null })
    }

    if (operation === 'delete') {
      let sql = `DELETE FROM ${table}`
      const params: any[] = []
      let paramIndex = 1
      const whereClauses: string[] = []

      if (filters) {
        for (const f of filters) {
          if (f.op === 'eq') {
            whereClauses.push(`${f.col} = $${paramIndex}`)
            params.push(f.value)
            paramIndex++
          }
        }
      }

      if (whereClauses.length) sql += ` WHERE ${whereClauses.join(' AND ')}`
      sql += ' RETURNING *'
      const result = await pool.query(sql, params)
      return NextResponse.json({ data: result.rows, error: null })
    }

    return NextResponse.json({ error: 'Unknown operation' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  }
}
