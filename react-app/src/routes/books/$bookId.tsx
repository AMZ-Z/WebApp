import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Image,
  message,
  Select,
  Table,
  Modal,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { getBook, updateBook, type Book } from '../../api/books'
import { listAuthors, type Author } from '../../api/authors'
import { listClients, type Client } from '../../api/clients'
import { listSales, createSale, type Sale } from '../../api/sales'

type BuyerRow = {
  saleId: string
  clientId: string
  clientName: string
}

type PurchaseFormValues = {
  clientId: string
}

export default function BookDetails() {
  const { bookId } = useParams({ from: '/books/$bookId' })
  const [form] = Form.useForm()
  const [book, setBook] = useState<Book | null>(null)
  const [authors, setAuthors] = useState<Author[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [purchaseForm] = Form.useForm<PurchaseFormValues>()
  const [purchaseSaving, setPurchaseSaving] = useState(false)

  const load = async () => {
    if (!bookId) return
    setLoading(true)
    try {
      const [b, as, sales, cls] = await Promise.all([
        getBook(bookId),
        listAuthors(),
        listSales(undefined, bookId),
        listClients(),
      ])

      setBook(b)
      setAuthors(as)
      setClients(cls)

      // Remplir le formulaire avec les données du livre
      form.setFieldsValue({
        title: b.title,
        yearPublished: b.yearPublished,
        authorId: b.authorId,
        photoUrl: b.photoUrl ?? undefined,
      })

      // Map des noms de clients (au cas où s.client soit undefined)
      const clientNameById: Record<string, string> = {}
      cls.forEach(c => {
        clientNameById[c.id] =
          [c.firstName, c.lastName].filter(Boolean).join(' ') || c.id
      })

      // Lignes pour le tableau des acheteurs
      const rows: BuyerRow[] = (sales as Sale[]).map(s => {
        const clientId = s.client?.id ?? s.clientId
        const clientName =
          (s.client &&
            [s.client.firstName, s.client.lastName]
              .filter(Boolean)
              .join(' ')) ||
          clientNameById[clientId] ||
          clientId

        return {
          saleId: s.id,
          clientId,
          clientName,
        }
      })

      setBuyers(rows)
    } catch (e) {
      console.error(e)
      message.error('Impossible de charger ce livre')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const onSave = async () => {
    if (!bookId) return
    try {
      const values = await form.validateFields()
      setSaving(true)
      const updated = await updateBook(bookId, values)
      setBook(updated)
      message.success('Livre mis à jour')
      form.setFieldsValue({
        title: updated.title,
        yearPublished: updated.yearPublished,
        authorId: updated.authorId,
        photoUrl: (updated as any).photoUrl ?? undefined,
      })
    } catch (e: any) {
      if (e?.errorFields) return
      console.error(e)
      message.error('Erreur lors de la sauvegarde du livre')
    } finally {
      setSaving(false)
    }
  }

  const openPurchaseModal = () => {
    setPurchaseModalOpen(true)
  }

  const onCreatePurchase = async () => {
    if (!bookId) return
    try {
      const values = await purchaseForm.validateFields()
      setPurchaseSaving(true)

      // Pas de date dans l'UI → on en met une valide pour le backend
      const purchasedAt = new Date().toISOString()

      await createSale({
        clientId: values.clientId,
        bookId,
        purchasedAt,
      })

      message.success('Achat enregistré')
      setPurchaseModalOpen(false)
      purchaseForm.resetFields()
      await load()
    } catch (e: any) {
      if (e?.errorFields) return
      console.error(e)
      message.error("Erreur lors de l'enregistrement de l'achat")
    } finally {
      setPurchaseSaving(false)
    }
  }

  const columns: ColumnsType<BuyerRow> = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
  ]

  if (!book) {
    return (
      <Card title="Book details" loading extra={<Link to="/books">← Back</Link>} />
    )
  }

  const buyersCount = new Set(buyers.map(b => b.clientId)).size

  return (
    <Card
      title={book.title}
      loading={loading}
      extra={<Link to="/books">← Back</Link>}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="start">
          {book.photoUrl ? (
            <Image src={book.photoUrl} width={140} style={{ borderRadius: 8 }} />
          ) : null}

          <Form
            layout="vertical"
            form={form}
            style={{ minWidth: 360 }}
            onFinish={onSave}
          >
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="yearPublished"
              label="Year"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="authorId"
              label="Author"
              rules={[{ required: true }]}
            >
              <Select
                options={authors.map(a => ({
                  value: a.id, // ⚠️ surtout pas Number(a.id) → ce sont des UUID
                  label:
                    [a.firstName ?? '', a.lastName ?? '']
                      .filter(Boolean)
                      .join(' ') || a.id,
                }))}
                showSearch
                optionFilterProp="label"
                placeholder="Select an author"
              />
            </Form.Item>

            <Form.Item name="photoUrl" label="Photo URL">
              <Input placeholder="https://..." />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save
            </Button>
          </Form>
        </Space>

        <div>
          <h3>
            Clients who bought this book{' '}
            <span style={{ fontWeight: 'normal' }}>({buyersCount})</span>
          </h3>
          <Table<BuyerRow>
            rowKey={row => row.saleId}
            columns={columns}
            dataSource={buyers}
            pagination={false}
          />
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={openPurchaseModal}
          >
            Add sale
          </Button>
        </div>
      </Space>

      <Modal
        title="Add sale"
        open={purchaseModalOpen}
        onCancel={() => setPurchaseModalOpen(false)}
        onOk={onCreatePurchase}
        confirmLoading={purchaseSaving}
      >
        <Form<PurchaseFormValues> form={purchaseForm} layout="vertical">
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: 'Client required' }]}
          >
            <Select
              options={clients.map(c => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`.trim(),
              }))}
              placeholder="Choose a client"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
