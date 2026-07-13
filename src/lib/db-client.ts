// Client-side DB client - calls API routes (no pg in browser)
import { getUser } from '@/lib/auth'

class ClientQueryBuilder {
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
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this.table,
          select: this.selectCols,
          filters: this.filters,
          order: this.orderCol ? { col: this.orderCol, asc: this.orderAsc } : null,
          limit: this.limitCount,
          single: this.singleResult,
          operation: this.mode,
          data: this.mode === 'insert' ? this.insertData : this.mode === 'update' ? { set: this.updateData, filters: this.filters } : undefined,
        }),
      })
      return await res.json()
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

export function createClient() {
  return {
    from,
    auth: {
      getUser: async () => ({ data: { user: getUser() }, error: null }),
      signInWithPassword: async () => ({ data: { user: getUser() }, error: null }),
      signOut: async () => ({ error: null }),
    },
  }
}

export function from(table: string): ClientQueryBuilder {
  return new ClientQueryBuilder(table)
}
