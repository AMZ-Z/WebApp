import { useEffect, useState } from 'react'
import { Table, Button, Space, Popconfirm, message, Avatar, Modal, Form, Input, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listAuthors, deleteAuthor, createAuthor, updateAuthor, type Author } from '../../api/authors'

export default function AuthorsIndex() {
  const [rows, setRows] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Author | null>(null)
  const [form] = Form.useForm()

  const [detailsAuthor, setDetailsAuthor] = useState<Author | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try { setRows(await listAuthors()) } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const onDelete = async (id: string) => {
    await deleteAuthor(id); await refresh(); message.success('Author deleted')
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateAuthor(editingRecord.id, values)
        message.success('Author updated')
      } else {
        await createAuthor(values)
        message.success('Author created')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditingRecord(null)
      await refresh()
    } catch (error) {
      message.error('Failed to save author')
      console.error('Validation Failed:', error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const showCreateModal = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const showEditModal = (record: Author) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const showDetailsModal = (record: Author) => {
    setDetailsAuthor(record)
    setIsDetailsOpen(true)
  }

  const closeDetails = () => {
    setDetailsAuthor(null)
    setIsDetailsOpen(false)
  }

  const columns: ColumnsType<Author> = [
    { title: 'Photo', dataIndex: 'photoUrl', width: 80, render: (url, r) => <Avatar src={url} style={{ backgroundColor: '#87d068' }}>{(r.firstName?.[0] || '') + (r.lastName?.[0] || '')}</Avatar> },
    { title: 'First name', dataIndex: 'firstName' },
    { title: 'Last name', dataIndex: 'lastName' },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button onClick={() => showDetailsModal(r)}>Details</Button>
        <Button type="primary" onClick={() => showEditModal(r)}>Edit</Button>
        <Popconfirm title="Delete this author?" onConfirm={() => onDelete(r.id)}>
          <Button danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <Card title="Authors" extra={<Button type="primary" onClick={showCreateModal}>New author</Button>}>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />

      <Modal title={editingRecord ? 'Edit author' : 'Create author'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form layout="vertical" form={form}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true }]}><Input/></Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true }]}><Input/></Form.Item>
          <Form.Item name="photoUrl" label="Photo URL"><Input placeholder="https://..."/></Form.Item>
        </Form>
      </Modal>

      <Modal title="Author details" open={isDetailsOpen} onOk={closeDetails} onCancel={closeDetails} footer={[<Button key="close" onClick={closeDetails}>Close</Button>]}> 
        {detailsAuthor && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar size={64} src={detailsAuthor.photoUrl} style={{ backgroundColor: '#87d068' }}>{(detailsAuthor.firstName?.[0] || '') + (detailsAuthor.lastName?.[0] || '')}</Avatar>
            <div>
              <div><strong>First name:</strong> {detailsAuthor.firstName}</div>
              <div><strong>Last name:</strong> {detailsAuthor.lastName}</div>
              {detailsAuthor.photoUrl && <div><strong>Photo URL:</strong> <a href={detailsAuthor.photoUrl} target="_blank" rel="noreferrer">{detailsAuthor.photoUrl}</a></div>}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
