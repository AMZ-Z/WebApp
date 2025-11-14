import { http } from './http'

export type Sale = {
  id: string
  clientId: string
  bookId: string
  purchasedAt: string
  client?: {
    id: string
    firstName?: string
    lastName?: string
  }
  book?: {
    id: string
    title?: string
    author?: {
      firstName?: string
      lastName?: string
    }
  }
}

export type NewSale = {
  clientId: string
  bookId: string
  purchasedAt: string
}

/**
 * Crée une vente
 */
export const createSale = async (payload: NewSale) =>
  (await http.post('/sales', payload)).data as Sale

/**
 * Liste les ventes, avec filtres optionnels :
 * - clientId : filtre par client
 * - bookId : filtre par livre
 *
 * => /sales
 * => /sales?clientId=...
 * => /sales?bookId=...
 * => /sales?clientId=...&bookId=...
 */
export const listSales = async (
  clientId?: string,
  bookId?: string,
): Promise<Sale[]> => {
  const params = new URLSearchParams()

  if (clientId) params.append('clientId', clientId)
  if (bookId) params.append('bookId', bookId)

  const query = params.toString()
  const url = query ? `/sales?${query}` : '/sales'

  return (await http.get(url)).data as Sale[]
}
