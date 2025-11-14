import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Image,
  Card,
  Select,
} from 'antd'
import { Link } from '@tanstack/react-router'
import type { ColumnsType } from 'antd/es/table'
import { listBooks, createBook, deleteBook, type Book } from '../../api/books'
import { listAuthors, type Author } from '../../api/authors'

export default function BooksIndex() {
  const [rows, setRows] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [authors, setAuthors] = useState<Author[]>([])

  const refresh = async () => {
    setLoading(true)
    try {
      const [books, as] = await Promise.all([listBooks(), listAuthors()])
      setRows(books)
      setAuthors(as)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onCreate = async () => {
    const values = await form.validateFields()
    await createBook(values)
    setOpen(false)
    form.resetFields()
    await refresh()
    message.success('Book created')
  }

  const onDelete = async (id: string) => {
    await deleteBook(id)
    await refresh()
    message.success('Book deleted')
  }

  const columns: ColumnsType<Book> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (t, r) => (
        <Link to="/books/$bookId" params={{ bookId: r.id }}>
          {t}
        </Link>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'yearPublished',
      width: 120,
    },
    {
      title: 'Author',
      render: (_, r) =>
        [...authors]
          .find(a => a.id === r.authorId)
          ? `${authors.find(a => a.id === r.authorId)!.firstName} ${
              authors.find(a => a.id === r.authorId)!.lastName
            }`
          : '—',
    },
    {
      title: 'Cover',
      dataIndex: 'photoUrl',
      width: 80,
      render: (url?: string | null) =>
        url ? <Image src={url} width={40} /> : null,
    },
    {
      title: 'Actions',
      width: 200,
      render: (_, r) => (
        <Space>
          <Link to="/books/$bookId" params={{ bookId: r.id }}>
            <Button type="primary">Edit</Button>
          </Link>

          <Popconfirm
            title="Delete this book?"
            onConfirm={() => onDelete(r.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Books"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          New book
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />

      <Modal
        title="Create book"
        open={open}
        onOk={onCreate}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true }]}
          >
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
                value: a.id,
                label: `${a.firstName} ${a.lastName}`.trim(),
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder="Select an author"
            />
          </Form.Item>
          <Form.Item name="photoUrl" label="Photo URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
