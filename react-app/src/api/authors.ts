import { http } from './http'
export type Author = { id: string; firstName: string; lastName: string; photoUrl?: string | null }
export const listAuthors = async () => (await http.get('/authors')).data as Author[]
export const createAuthor = async (payload: Partial<Author>) => (await http.post('/authors', payload)).data
export const deleteAuthor = async (id: string) => { await http.delete(`/authors/${id}`) }
// Use PUT for updates (some backends expect PUT instead of PATCH)
export const updateAuthor = async (id: string, payload: Partial<Author>) => (await http.patch(`/authors/${id}`, payload)).data
export const getAuthor = async (id: string) => (await http.get(`/authors/${id}`)).data as Author
export const getAuthorNameMap = async (): Promise<Record<string,string>> => {
  const rows = await listAuthors(); const map: Record<string,string> = {}
  for (const a of rows) map[a.id] = [a.firstName, a.lastName].filter(Boolean).join(' ')
  return map
}
