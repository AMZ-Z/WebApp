import { http } from './http'

export type Client = {
  id: string
  firstName: string
  lastName: string
  email?: string
  photoUrl?: string | null
  // fourni par le backend dans listClientsWithCounts()
  purchasesCount?: number
}

export type Purchase = {
  saleId: string
  bookId: string
  bookTitle: string
  authorId: string
  authorFirstName: string
  authorLastName: string
  purchasedAt: string // ISO
}

export type ClientDetails = {
  client: Client
  purchases: Purchase[]
}

export const listClients = async (): Promise<Client[]> =>
  (await http.get('/clients')).data as Client[]

/**
 * Renvoie le détail complet : client + achats
 * (correspond à ClientDetailsModel côté backend)
 */
export const getClientDetails = async (id: string): Promise<ClientDetails> =>
  (await http.get(`/clients/${id}`)).data as ClientDetails

/**
 * Utilisé par AppLayout pour les breadcrumbs.
 * On ne renvoie que l'objet client.
 */
export const getClient = async (id: string): Promise<Client> => {
  const details = await getClientDetails(id)
  return details.client
}

export const createClient = async (payload: Partial<Client>): Promise<Client> =>
  (await http.post('/clients', payload)).data as Client

export const updateClient = async (id: string, payload: Partial<Client>): Promise<Client> =>
  (await http.patch(`/clients/${id}`, payload)).data as Client

export const deleteClient = async (id: string): Promise<void> => {
  await http.delete(`/clients/${id}`)
}

/**
 * Liste des achats d’un client (livres achetés)
 */
export const listClientPurchases = async (id: string): Promise<Purchase[]> => {
  const details = await getClientDetails(id)
  return details.purchases
}
