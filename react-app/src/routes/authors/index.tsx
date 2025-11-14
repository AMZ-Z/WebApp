import { useEffect, useState } from 'react'
import { Table, Button, Space, Popconfirm, message, Avatar, Card, Modal, Form, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from '@tanstack/react-router'
import { listAuthors, deleteAuthor, createAuthor, type Author } from '../../api/authors'
import { listBooks } from '../../api/books'

export default function AuthorsIndex() {
  const [rows, setRows] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [bookCounts, setBookCounts] = useState<Record<string, number>>({})

  const refresh = async () => {
    setLoading(true)
    try {
      const [authors, books] = await Promise.all([listAuthors(), listBooks()])
      setRows(authors)
      const map: Record<string, number> = {}
      for (const b of books) map[b.authorId] = (map[b.authorId] || 0) + 1
      setBookCounts(map)
    } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const onDelete = async (id: string) => {
    await deleteAuthor(id)
    await refresh()
    message.success('Author deleted')
  }

  const showCreateModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createAuthor(values)
      setIsModalOpen(false)
      form.resetFields()
      await refresh()
      message.success('Author created')
    } catch (err) {
      message.error('Failed to create author')
    }
  }

  const columns: ColumnsType<Author> = [
    {
      title: 'Photo',
      dataIndex: 'photoUrl',
      width: 80,
      render: (url, r) => (
        <Avatar src={url} style={{ backgroundColor: '#87d068' }}>
          {(r.firstName?.[0] || '') + (r.lastName?.[0] || '')}
        </Avatar>
      ),
    },
    { title: 'First name', dataIndex: 'firstName' , 
              render: (t, r) => (
        <Link to="/authors/$authorId" params={{ authorId: r.id }}>
          {t}
        </Link>
      ),
    },
    { title: 'Last name', dataIndex: 'lastName'  , 
        render: (t, r) => (
        <Link to="/authors/$authorId" params={{ authorId: r.id }}>
          {t}
        </Link>
      ),
    },
    { title: 'Books', dataIndex: 'id', render: (id) => (bookCounts[id] || 0) },
    {
      title: 'Actions',
      render: (_, r) => (
        <Space>
          <Link to="/authors/$authorId" params={{ authorId: r.id }}>
            <Button type="primary">Edit</Button>
          </Link>
          <Popconfirm title="Delete this author?" onConfirm={() => onDelete(r.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="Authors" extra={<Button type="primary" onClick={showCreateModal}>New author</Button>}>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />

      <Modal title="Create author" open={isModalOpen} onOk={handleCreate} onCancel={() => setIsModalOpen(false)}>
        <Form layout="vertical" form={form}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="photoUrl" label="Photo URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
