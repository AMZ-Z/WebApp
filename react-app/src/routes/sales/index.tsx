import { useEffect, useState } from 'react'
import { Table, Card, Button, Modal, Form, Select, DatePicker, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listClients } from '../../api/clients'
import { listBooks } from '../../api/books'
import { createSale, listSales, type Sale } from '../../api/sales'
import dayjs, { Dayjs } from 'dayjs'

type Row = {
  id: string
  clientName: string
  bookTitle: string

  clientId: string
  bookId: string
}

type FormVals = { clientId: string; bookId: string; date?: Dayjs }

export default function SalesIndex() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [clientsOpts, setClientsOpts] = useState<{ value:string; label:string }[]>([])
  const [booksOpts, setBooksOpts] = useState<{ value:string; label:string }[]>([])
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<FormVals>()

  const refresh = async () => {
    setLoading(true)
    try {
      const [cls, bks, sales] = await Promise.all([listClients(), listBooks(), listSales()])
      const clientMap: Record<string,string> = {}
      cls.forEach(c => clientMap[c.id] = [c.firstName, c.lastName].filter(Boolean).join(' '))
      const bookMap: Record<string,{ title: string; authorId?: string }> = {}
      bks.forEach(b => bookMap[b.id] = { title: b.title, authorId: b.authorId })
      const authorNameByBook: Record<string,string> = {}
      // we don't have authors endpoint here; try to use sale.book.author if present, else leave blank
      const rows: Row[] = sales.map(s => {
        const clientName = s.client?.firstName || s.client?.lastName ? [s.client?.firstName, s.client?.lastName].filter(Boolean).join(' ') : (clientMap[s.clientId] || s.clientId)
        const bookTitle = s.book?.title || bookMap[s.bookId]?.title || s.bookId
        return { id: s.id, clientId: s.clientId, bookId: s.bookId, clientName, bookTitle}
      })
      setRows(rows)
      setClientsOpts(cls.map(c => ({ value: c.id, label: [c.firstName, c.lastName].filter(Boolean).join(' ') })))
      setBooksOpts(bks.map(b => ({ value: b.id, label: b.title })))
    } catch (e: any) {
      console.error(e)
      message.error(e?.response?.data?.message || 'Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const columns: ColumnsType<Row> = [
    { title: 'Client', dataIndex: 'clientName' },
    { title: 'Book', dataIndex: 'bookTitle' },

  ]

const onCreateSale = async () => {
  try {
    setSubmitting(true)
    const vals = await form.validateFields()

    // Toujours une string ISO valide pour le backend
    const purchasedAt = vals.date
      ? vals.date.toDate().toISOString()
      : new Date().toISOString()

    await createSale({
      clientId: vals.clientId,
      bookId: vals.bookId,
      purchasedAt,
    })

    message.success('Sale added')
    setOpen(false)
    form.resetFields()
    await refresh()
  } catch (e: any) {
    if (e?.errorFields) return
    console.error(e)
    const msg = e?.response?.data?.message || e?.message || 'Failed to create sale'
    message.error(Array.isArray(msg) ? msg.join(', ') : msg)
  } finally {
    setSubmitting(false)
  }
}


  return (
    <Card title="Sales" extra={<Button type="primary" onClick={() => setOpen(true)}>Add sale</Button>}>
      <Table rowKey="id" loading={loading} dataSource={rows} columns={columns} />
      <Modal title="Add sale" open={open} onOk={onCreateSale} onCancel={() => setOpen(false)} confirmLoading={submitting}>
        <Form layout="vertical" form={form}>
          <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
            <Select options={clientsOpts} showSearch placeholder="Choose a client" />
          </Form.Item>
          <Form.Item name="bookId" label="Book" rules={[{ required: true }]}>
            <Select options={booksOpts} showSearch placeholder="Choose a book" />
          </Form.Item>
          <Form.Item name="date" label="Date (optional)">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
