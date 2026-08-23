import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

class QueryBuilder {
  private table: string
  private selectCols: string = '*'
  private filters: Array<{ col: string; op: string; value: any }> = []
  private orderCol: string | null = null
  private orderAsc: boolean = true
  private limitCount: number | null = null
  private singleResult = false
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private insertData: Record<string, any> | null = null
  private updateData: Record<string, any> | null = null

  constructor(table: string) {
    this.table = table
  }

  select(cols: string = '*'): this {
    this.selectCols = cols
    return this
  }

  eq(col: string, val: any): this {
    this.filters.push({ col, op: 'eq', value: val })
    return this
  }

  neq(col: string, val: any): this {
    this.filters.push({ col, op: 'neq', value: val })
    return this
  }

  is(col: string, val: null | boolean): this {
    this.filters.push({ col, op: 'is', value: val })
    return this
  }

  not(col: string, op: string, val: any): this {
    this.filters.push({ col, op: 'not', value: val })
    return this
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCol = col
    this.orderAsc = opts?.ascending ?? true
    return this
  }

  limit(n: number): this {
    this.limitCount = n
    return this
  }

  single(): this {
    this.singleResult = true
    this.limitCount = 1
    return this
  }

  insert(data: Record<string, any>): this {
    this.mode = 'insert'
    this.insertData = data
    return this
  }

  update(data: Record<string, any>): this {
    this.mode = 'update'
    this.updateData = data
    return this
  }

  delete(): this {
    this.mode = 'delete'
    return this
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      switch (this.mode) {
        case 'insert': return await this.executeInsert()
        case 'update': return await this.executeUpdate()
        case 'delete': return await this.executeDelete()
        default: return await this.executeSelect()
      }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  private buildWhere(startIdx = 1, table?: string) {
    const clauses: string[] = []
    const params: any[] = []
    let idx = startIdx
    const prefix = table ? `${table}.` : ''
    for (const f of this.filters) {
      if (f.op === 'is' && f.value === null) {
        clauses.push(`${prefix}${f.col} IS NULL`)
      } else if (f.op === 'is' && f.value === false) {
        clauses.push(`${prefix}${f.col} IS NOT NULL`)
      } else if (f.op === 'eq') {
        clauses.push(`${prefix}${f.col} = $${idx}`)
        params.push(f.value)
        idx++
      } else if (f.op === 'neq') {
        clauses.push(`${prefix}${f.col} != $${idx}`)
        params.push(f.value)
        idx++
      } else if (f.op === 'not' && f.value === null) {
        clauses.push(`${prefix}${f.col} IS NOT NULL`)
      }
    }
    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params, nextIdx: idx }
  }

  // Parses Supabase-style select strings: '*, patients(id, name), specialties(name)'.
  // Embeds become LEFT JOINs by convention: relation 'patients' joins via 'patient_id'.
  private parseSelect() {
    const parts: string[] = []
    let depth = 0
    let current = ''
    for (const ch of this.selectCols) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        parts.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    if (current.trim()) parts.push(current.trim())

    const identRe = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    const base: string[] = []
    const embeds: Array<{ relation: string; fk: string; cols: string[] }> = []
    for (const part of parts) {
      const embed = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)$/)
      if (embed) {
        const relation = embed[1]
        const cols = embed[2].split(',').map(c => c.trim()).filter(Boolean)
        for (const c of cols) {
          if (!identRe.test(c)) throw new Error(`Invalid column in select: ${c}`)
        }
        const singular = relation.endsWith('ies') ? `${relation.slice(0, -3)}y` : relation.replace(/s$/, '')
        embeds.push({ relation, fk: `${singular}_id`, cols })
      } else if (part === '*') {
        base.push('*')
      } else if (identRe.test(part)) {
        base.push(part)
      } else {
        throw new Error(`Invalid select expression: ${part}`)
      }
    }
    return { base, embeds }
  }

  private async executeSelect() {
    const { base, embeds } = this.parseSelect()
    const hasJoins = embeds.length > 0
    const qualify = (col: string) => (hasJoins ? `${this.table}.${col}` : col)

    const selectList: string[] = base.includes('*')
      ? [qualify('*')]
      : base.map(qualify)
    for (const e of embeds) {
      const pairs = e.cols.map(c => `'${c}', ${e.relation}.${c}`).join(', ')
      // Without the CASE, a missing relation would yield {col: null, ...} instead of NULL
      selectList.push(
        `CASE WHEN ${e.relation}.id IS NULL THEN NULL ELSE json_build_object(${pairs}) END AS ${e.relation}`
      )
    }

    const joins = embeds
      .map(e => `LEFT JOIN ${e.relation} ON ${e.relation}.id = ${this.table}.${e.fk}`)
      .join(' ')
    const { where, params } = this.buildWhere(1, hasJoins ? this.table : undefined)
    const order = this.orderCol ? `ORDER BY ${qualify(this.orderCol)} ${this.orderAsc ? 'ASC' : 'DESC'}` : ''
    const limit = this.limitCount ? `LIMIT ${this.limitCount}` : ''
    const sql = [`SELECT ${selectList.join(', ')} FROM ${this.table}`, joins, where, order, limit]
      .filter(Boolean)
      .join(' ')
    const result = await pool.query(sql, params)
    return { data: this.singleResult ? result.rows[0] || null : result.rows, error: null }
  }

  private async executeInsert() {
    const cols = Object.keys(this.insertData!)
    const vals = Object.values(this.insertData!)
    const placeholders = cols.map((_, i) => `$${i + 1}`)
    const sql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
    const result = await pool.query(sql, vals)
    return { data: result.rows[0], error: null }
  }

  private async executeUpdate() {
    const setCols = Object.keys(this.updateData!)
    const setVals = Object.values(this.updateData!)
    const setClauses = setCols.map((col, i) => `${col} = $${i + 1}`)
    const { where, params: filterParams } = this.buildWhere(setCols.length + 1)
    // Merge: set params first, then filter params (with shifted indices)
    const allParams = [...setVals, ...filterParams]
    const sql = `UPDATE ${this.table} SET ${setClauses.join(', ')} ${where} RETURNING *`
    const result = await pool.query(sql, allParams)
    return { data: this.singleResult ? result.rows[0] || null : result.rows, error: null }
  }

  private async executeDelete() {
    const { where, params } = this.buildWhere()
    const sql = `DELETE FROM ${this.table} ${where} RETURNING *`
    const result = await pool.query(sql, params)
    return { data: result.rows, error: null }
  }
}

export function from(table: string): QueryBuilder {
  return new QueryBuilder(table)
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}
