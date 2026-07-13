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

  private buildWhere() {
    const clauses: string[] = []
    const params: any[] = []
    let idx = 1
    for (const f of this.filters) {
      if (f.op === 'is' && f.value === null) {
        clauses.push(`${f.col} IS NULL`)
      } else if (f.op === 'is' && f.value === false) {
        clauses.push(`${f.col} IS NOT NULL`)
      } else if (f.op === 'eq') {
        clauses.push(`${f.col} = $${idx}`)
        params.push(f.value)
        idx++
      } else if (f.op === 'neq') {
        clauses.push(`${f.col} != $${idx}`)
        params.push(f.value)
        idx++
      } else if (f.op === 'not' && f.value === null) {
        clauses.push(`${f.col} IS NOT NULL`)
      }
    }
    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params, nextIdx: idx }
  }

  private async executeSelect() {
    const { where, params } = this.buildWhere()
    const order = this.orderCol ? `ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}` : ''
    const limit = this.limitCount ? `LIMIT ${this.limitCount}` : ''
    const sql = `SELECT ${this.selectCols} FROM ${this.table} ${where} ${order} ${limit}`
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
    const { where, params: filterParams } = this.buildWhere()
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
