import React, { useEffect, useState } from 'react'
import { ConfigProvider, Layout, Menu, Breadcrumb, theme } from 'antd'
import { Outlet, Link, useRouterState } from '@tanstack/react-router'
import { getBook } from '../api/books'
import { getClient } from '../api/clients'
import { getAuthor } from '../api/authors'

const TITLE_MAP: Record<string, string> = { books: 'Books', authors: 'Authors', clients: 'Clients', sales: 'Sales' }
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

export default function AppLayout() {
  const state = useRouterState()
  const path = state.location.pathname
  const parts = path.split('/').filter(Boolean)

  const [titleCache, setTitleCache] = useState<Record<string,string>>({})

  useEffect(() => {
    (async () => {
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i]
        if (isUUID(seg)) {
          const base = parts[i-1]
          try {
            if (base === 'books') {
              const b = await getBook(seg); setTitleCache(m => ({ ...m, [seg]: b.title }))
            } else if (base === 'clients') {
              const c = await getClient(seg); setTitleCache(m => ({ ...m, [seg]: [c.firstName, c.lastName].filter(Boolean).join(' ') }))
            } else if (base === 'authors') {
              const a = await getAuthor(seg); setTitleCache(m => ({ ...m, [seg]: [a.firstName, a.lastName].filter(Boolean).join(' ') }))
            }
          } catch {}
        }
      }
    })()
  }, [path])

  const items = parts.map((seg, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/')
    const pretty = TITLE_MAP[seg] ?? titleCache[seg] ?? (isUUID(seg) ? 'Details' : seg)
    return { title: <Link to={href}>{pretty}</Link> }
  })

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#2f54eb', borderRadius: 10, colorLink: '#2f54eb' } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="app-logo">InnoHub</div>
          <Menu theme="dark" mode="horizontal" selectable={false} style={{ background: 'transparent' }}>
            <Menu.Item key="books"><Link to="/books">Books</Link></Menu.Item>
            <Menu.Item key="authors"><Link to="/authors">Authors</Link></Menu.Item>
            <Menu.Item key="clients"><Link to="/clients">Clients</Link></Menu.Item>
            <Menu.Item key="sales"><Link to="/sales">Sales</Link></Menu.Item>
          </Menu>
        </Layout.Header>
        <Layout.Content style={{ padding: 24 }}>
          <Breadcrumb items={items} style={{ marginBottom: 16 }} />
          <Outlet />
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}
