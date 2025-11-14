import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, Form, Input, Button, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  getClientDetails,
  updateClient,
  type Client,
  type Purchase,
} from '../../api/clients'

type Row = {
  bookId: string
  bookTitle: string
  authorName: string
}


function formatDate(iso: string): string {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return iso
  return dt.toLocaleString('fr-FR')
}

export default function ClientDetails() {
  const { clientId } = useParams({ from: '/clients/$clientId' })
  const [client, setClient] = useState<Client | null>(null)
  const [purchases, setPurchases] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const details = await getClientDetails(clientId)
      setClient(details.client)
    setPurchases(
      details.purchases.map((p: Purchase): Row => ({
        bookId: p.bookId,
        bookTitle: p.bookTitle,
        authorName: [p.authorFirstName, p.authorLastName].filter(Boolean).join(' ') || '—',
      })),
    )

      form.setFieldsValue({
        firstName: details.client.firstName,
        lastName: details.client.lastName,
        email: details.client.email,
      })
    } catch (e) {
      console.error(e)
      message.error('Impossible de charger ce client')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const onSave = async () => {
    if (!clientId) return
    try {
      const values = await form.validateFields()
      setSaving(true)
      const updated = await updateClient(clientId, values)
      setClient(prev => (prev ? { ...prev, ...updated } : updated))
      message.success('Client mis à jour')
    } catch (e) {
      // @ts-expect-error: AntD validation
      if (e && e.errorFields) return
      console.error(e)
      message.error('Échec de la mise à jour du client')
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnsType<Row> = [
    {
      title: 'Livre',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text: string, row: Row) => (
        <Link to="/books/$bookId" params={{ bookId: row.bookId }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Auteur',
      dataIndex: 'authorName',
      key: 'authorName',
    },

  ]

  return (
    <Card
      title="Détails du client"
      loading={loading && !client}
      extra={
        <Link to="/clients">
          ← Retour à la liste
        </Link>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onSave}
          style={{ maxWidth: 480 }}
        >
          <Form.Item
            name="firstName"
            label="Prénom"
            rules={[{ required: true, message: 'Prénom obligatoire' }]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Nom"
            rules={[{ required: true, message: 'Nom obligatoire' }]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" disabled={loading} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            disabled={loading}
          >
            Enregistrer
          </Button>
        </Form>
<div>
  <h3>
    Livres achetés
    <span style={{ fontWeight: 'normal', marginLeft: 8 }}>
      ({purchases.length})
    </span>
  </h3>

  <Table<Row>
    rowKey={row => row.bookId}
    columns={columns}
    dataSource={purchases}
    pagination={false}
  />
</div>

      </Space>
    </Card>
  )
}
