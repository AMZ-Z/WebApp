import { useEffect, useState } from 'react'
import { Table, Card, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listClients, createClient, deleteClient, type Client } from '../../api/clients'
import { Link } from '@tanstack/react-router'

export default function ClientsIndex() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await listClients()
      setRows(data)
    } catch (e) {
      console.error(e)
      message.error('Impossible de charger les clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      await createClient(values)
      message.success('Client créé')
      setOpen(false)
      form.resetFields()
      await refresh()
    } catch (e) {
      // erreur de validation AntD => on ne spam pas un message d’erreur
      // @ts-expect-error: AntD met errorFields sur certaines erreurs
      if (e && e.errorFields) return
      console.error(e)
      message.error('Échec de la création du client')
    }
  }

  const onDelete = async (id: string) => {
    try {
      await deleteClient(id)
      message.success('Client supprimé')
      await refresh()
    } catch (e) {
      console.error(e)
      message.error('Échec de la suppression du client')
    }
  }

  const columns: ColumnsType<Client> = [
    {
      title: 'Prénom',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text: string, client: Client) => (
        <Link to="/clients/$clientId" params={{ clientId: client.id }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Nom',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text: string, client: Client) => (
        <Link to="/clients/$clientId" params={{ clientId: client.id }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Livres achetés',
      key: 'purchasesCount',
      render: (_: unknown, client: Client) =>
        typeof client.purchasesCount === 'number' ? client.purchasesCount : 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, client: Client) => (
        <Space>
          <Link to="/clients/$clientId" params={{ clientId: client.id }}>
            <Button type="primary">Edit</Button>
          </Link>

          <Popconfirm
            title="Delete this client?"
            onConfirm={() => onDelete(client.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Clients"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          Nouveau client
        </Button>
      }
    >
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />

      <Modal
        title="Créer un client"
        open={open}
        onOk={onCreate}
        onCancel={() => setOpen(false)}
        okText="Créer"
        cancelText="Annuler"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="firstName"
            label="Prénom"
            rules={[{ required: true, message: 'Prénom obligatoire' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Nom"
            rules={[{ required: true, message: 'Nom obligatoire' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
