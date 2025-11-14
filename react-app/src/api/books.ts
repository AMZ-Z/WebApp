import { http } from './http'

// Modèle simple utilisé dans la liste et les formulaires
export type Book = {
  id: string
  title: string
  authorId: string
  yearPublished: number
  photoUrl?: string | null
  // champs optionnels si un jour tu veux les exploiter
  authorFirstName?: string
  authorLastName?: string
  purchasesCount?: number
}

// Structure renvoyée par GET /books/:id (BookDetailsModel côté backend)
export type BookDetails = {
  id: string
  title: string
  yearPublished: number
  photoUrl?: string | null
  author: {
    id: string
    firstName: string
    lastName: string
  }
  buyers: {
    clientId: string
    firstName: string
    lastName: string
  }[]
  buyersCount: number
}

// Liste des livres
export const listBooks = async (): Promise<Book[]> =>
  (await http.get('/books')).data as Book[]

// Détails complets d’un livre
export const getBookDetails = async (id: string): Promise<BookDetails> =>
  (await http.get(`/books/${id}`)).data as BookDetails

// Détail "simplifié" pour le formulaire (avec authorId bien rempli)
export const getBook = async (id: string): Promise<Book> => {
  const d = await getBookDetails(id)
  return {
    id: d.id,
    title: d.title,
    yearPublished: d.yearPublished,
    photoUrl: d.photoUrl ?? null,
    authorId: d.author.id,
    authorFirstName: d.author.firstName,
    authorLastName: d.author.lastName,
  }
}

// Création
export const createBook = async (payload: {
  title: string
  authorId: string
  yearPublished: number
  photoUrl?: string | null
}): Promise<Book> =>
  (await http.post('/books', payload)).data as Book

// Mise à jour
export const updateBook = async (
  id: string,
  payload: Partial<Book>,
): Promise<Book> =>
  (await http.patch(`/books/${id}`, payload)).data as Book

// Suppression
export const deleteBook = async (id: string): Promise<void> => {
  await http.delete(`/books/${id}`)
}
