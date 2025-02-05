import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Radio, Space, message } from 'antd';
import { SendOutlined, LoadingOutlined, CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface ArticleForm {
  topic: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'humorous';
  length: 'short' | 'medium' | 'long';
  language: 'zh' | 'en';
}

const Article: React.FC = () => {
  const [form] = Form.useForm<ArticleForm>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async (values: ArticleForm) => {
    setLoading(true);
    try {
      // TODO: 调用 API 生成文章
      const response = await fetch('/api/generate/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      setResult(data.content);
      message.success('文章生成成功！');
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    message.success('已复制到剪贴板');
  };

  return (
    <div className="article-generator">
      <Card title="文章生成" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
        >
          <Form.Item
            label="主题"
            name="topic"
            rules={[{ required: true, message: '请输入文章主题' }]}
          >
            <Input placeholder="请输入文章主题，例如：人工智能对未来工作的影响" />
          </Form.Item>

          <Form.Item
            label="关键词"
            name="keywords"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入关键词，按回车分隔"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="语气"
            name="tone"
            rules={[{ required: true, message: '请选择语气' }]}
          >
            <Radio.Group>
              <Radio.Button value="professional">专业</Radio.Button>
              <Radio.Button value="casual">日常</Radio.Button>
              <Radio.Button value="humorous">诙谐</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="文章长度"
            name="length"
            rules={[{ required: true, message: '请选择文章长度' }]}
          >
            <Radio.Group>
              <Radio.Button value="short">短文（500字以内）</Radio.Button>
              <Radio.Button value="medium">中等（1000字左右）</Radio.Button>
              <Radio.Button value="long">长文（2000字以上）</Radio.Button>
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
              生成文章
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
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
          <div style={{ whiteSpace: 'pre-wrap' }}>{result}</div>
        </Card>
      )}
    </div>
  );
};

export default Article; 