import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, Avatar, Button, Form, Input, message, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getAuthor, updateAuthor, type Author } from '../../api/authors'
import { listBooks, type Book } from '../../api/books'
import { listSales } from '../../api/sales'

export default function AuthorDetails() {
  const { authorId } = useParams({ from: '/authors/$authorId' })
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [avgSales, setAvgSales] = useState<number | null>(null)

  const load = async () => {
    if (!authorId) return
    setLoading(true)
    try {
      const [a, allBooks, allSales] = await Promise.all([getAuthor(authorId), listBooks(), listSales()])
      setAuthor(a)
      const myBooks = allBooks.filter(b => b.authorId === authorId)
      setBooks(myBooks)
      // compute avg sales per book
      const salesByBook: Record<string, number> = {}
      for (const s of allSales) salesByBook[s.bookId] = (salesByBook[s.bookId] || 0) + 1
      const totalSales = myBooks.reduce((acc, b) => acc + (salesByBook[b.id] || 0), 0)
      setAvgSales(myBooks.length ? totalSales / myBooks.length : 0)
      const avg = myBooks.length ? totalSales / myBooks.length : null
      form.setFieldsValue(a)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [authorId])

  const handleSave = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      if (!authorId) return
      await updateAuthor(authorId, values)
      message.success('Author updated')
      await load()
    } catch (err: any) {
      console.error('Update author failed', err)
      const serverMsg = err?.response?.data?.message || err?.message
      message.error(serverMsg || 'Failed to update author')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<Book> = [
    { title: 'Title', dataIndex: 'title', render: (t, r) => <Link to="/books/$bookId" params={{ bookId: r.id }}>{t}</Link> },
    { title: 'Year', dataIndex: 'yearPublished' },
  ]

  if (!author) return <div>Loading...</div>

  return (
    <Card title={`Author • ${author.firstName} ${author.lastName}`} extra={<Link to="/authors"><Button>Back to list</Button></Link>}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Avatar size={120} src={author.photoUrl} style={{ backgroundColor: '#87d068' }}>{(author.firstName?.[0] || '') + (author.lastName?.[0] || '')}</Avatar>
        <div style={{ flex: 1 }}>
          <Form layout="vertical" form={form} initialValues={author}>
            <Form.Item name="firstName" label="First name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="photoUrl" label="Photo URL">
              <Input />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" onClick={handleSave} loading={submitting}>Save</Button>
              <Button onClick={() => form.setFieldsValue(author || {})}>Reset</Button>
            </div>
          </Form>
          <div style={{ marginTop: 16 }}>
            <div><strong>Books written:</strong> {books.length}</div>
            <div><strong>Average sales per book:</strong> {avgSales !== null ? avgSales.toFixed(2) : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Books</h3>
        <Table rowKey="id" dataSource={books} columns={columns} pagination={false} />
      </div>
    </Card>
  )
}
