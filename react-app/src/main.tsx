import React from 'react'
import ReactDOM from 'react-dom/client'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import AppLayout from './UI/AppLayout'
import BooksIndex from './routes/books/index'
import BookDetails from './routes/books/$bookId'
import AuthorsIndex from './routes/authors'
import AuthorDetails from './routes/authors/$authorId'
import ClientsIndex from './routes/clients/index'
import ClientDetails from './routes/clients/$clientId'
import SalesIndex from './routes/sales/index'
import HomePage from './routes/home'


import './UI/theme.css' 


const rootRoute = createRootRoute({ component: AppLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})


const booksRoute = createRoute({ getParentRoute: () => rootRoute, path: '/books' })
const booksIndexRoute = createRoute({ getParentRoute: () => booksRoute, path: '/', component: BooksIndex })
const bookDetailsRoute = createRoute({ getParentRoute: () => booksRoute, path: '$bookId', component: BookDetails })

const authorsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/authors' })
const authorsIndexRoute = createRoute({ getParentRoute: () => authorsRoute, path: '/', component: AuthorsIndex })
const authorDetailsRoute = createRoute({ getParentRoute: () => authorsRoute, path: '$authorId', component: AuthorDetails })


const clientsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/clients' })
const clientsIndexRoute = createRoute({ getParentRoute: () => clientsRoute, path: '/', component: ClientsIndex })
const clientDetailsRoute = createRoute({ getParentRoute: () => clientsRoute, path: '$clientId', component: ClientDetails })

const salesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sales', component: SalesIndex })

const routeTree = rootRoute.addChildren([
  homeRoute, // 👈 route /
  booksRoute.addChildren([booksIndexRoute, bookDetailsRoute]),
  authorsRoute.addChildren([authorsIndexRoute, authorDetailsRoute]),
  clientsRoute.addChildren([clientsIndexRoute, clientDetailsRoute]),
  salesRoute,
])


const router = createRouter({ routeTree })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
