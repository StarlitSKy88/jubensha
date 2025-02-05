import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Radio, Space, message, Tree } from 'antd';
import { SendOutlined, LoadingOutlined, CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface OutlineForm {
  topic: string;
  depth: 1 | 2 | 3;
  style: 'academic' | 'blog' | 'book';
  language: 'zh' | 'en';
}

interface OutlineNode {
  title: string;
  key: string;
  children?: OutlineNode[];
}

const Outline: React.FC = () => {
  const [form] = Form.useForm<OutlineForm>();
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<OutlineNode[]>([]);

  const handleGenerate = async (values: OutlineForm) => {
    setLoading(true);
    try {
      // TODO: 调用 API 生成大纲
      const response = await fetch('/api/generate/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      setOutline(data.outline);
      message.success('大纲生成成功！');
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const formatOutline = (nodes: OutlineNode[], level = 0): string => {
      return nodes.map(node => {
        const prefix = '  '.repeat(level) + (level === 0 ? '' : '- ');
        const content = prefix + node.title;
        if (node.children) {
          return content + '\n' + formatOutline(node.children, level + 1);
        }
        return content;
      }).join('\n');
    };

    const text = formatOutline(outline);
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  return (
    <div className="outline-generator">
      <Card title="大纲生成" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
        >
          <Form.Item
            label="主题"
            name="topic"
            rules={[{ required: true, message: '请输入主题' }]}
          >
            <Input placeholder="请输入主题，例如：人工智能的发展历程" />
          </Form.Item>

          <Form.Item
            label="大纲深度"
            name="depth"
            rules={[{ required: true, message: '请选择大纲深度' }]}
          >
            <Radio.Group>
              <Radio.Button value={1}>一级大纲</Radio.Button>
              <Radio.Button value={2}>二级大纲</Radio.Button>
              <Radio.Button value={3}>三级大纲</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="风格"
            name="style"
            rules={[{ required: true, message: '请选择风格' }]}
          >
            <Radio.Group>
              <Radio.Button value="academic">学术论文</Radio.Button>
              <Radio.Button value="blog">博客文章</Radio.Button>
              <Radio.Button value="book">图书章节</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="语言"
            name="language"
            rules={[{ required: true, message: '请选择语言' }]}
          >
            <Radio.Group>
              <Radio.Button value="zh">中文</Radio.Button>
              <Radio.Button value="en">英文</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={loading ? <LoadingOutlined /> : <SendOutlined />}
              loading={loading}
            >
              生成大纲
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {outline.length > 0 && (
        <Card
          title="生成结果"
          extra={
            <Space>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopy}
              >
                复制
              </Button>
            </Space>
          }
        >
          <Tree
            treeData={outline}
            defaultExpandAll
            showLine
          />
        </Card>
      )}
    </div>
  );
};

export default Outline; 