import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, List, Tag, Progress, Space, message } from 'antd';
import { SearchOutlined, LoadingOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface SEOForm {
  url?: string;
  content?: string;
  targetKeywords: string[];
}

interface SEOAnalysis {
  score: number;
  title: {
    text: string;
    length: number;
    score: number;
    suggestions: string[];
  };
  description: {
    text: string;
    length: number;
    score: number;
    suggestions: string[];
  };
  keywords: {
    density: Record<string, number>;
    suggestions: string[];
    score: number;
  };
  content: {
    wordCount: number;
    readability: number;
    suggestions: string[];
    score: number;
  };
}

const SEO: React.FC = () => {
  const [form] = Form.useForm<SEOForm>();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const handleAnalyze = async (values: SEOForm) => {
    setLoading(true);
    try {
      // TODO: 调用 API 进行 SEO 分析
      const response = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      setAnalysis(data);
      message.success('分析完成！');
    } catch (error) {
      message.error('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderScore = (score: number) => {
    const color = score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#f5222d';
    return (
      <Space>
        <Progress type="circle" percent={score} width={80} strokeColor={color} />
        {score >= 80 ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>优秀</Tag>
        ) : score >= 60 ? (
          <Tag color="warning" icon={<WarningOutlined />}>一般</Tag>
        ) : (
          <Tag color="error" icon={<WarningOutlined />}>需改进</Tag>
        )}
      </Space>
    );
  };

  return (
    <div className="seo-analyzer">
      <Card title="SEO 优化分析" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAnalyze}
        >
          <Tabs defaultActiveKey="content">
            <TabPane tab="网页分析" key="url">
              <Form.Item
                label="网页地址"
                name="url"
                rules={[{ type: 'url', message: '请输入有效的URL' }]}
              >
                <Input placeholder="请输入要分析的网页地址" />
              </Form.Item>
            </TabPane>
            <TabPane tab="内容分析" key="content">
              <Form.Item
                label="内容"
                name="content"
              >
                <TextArea
                  rows={6}
                  placeholder="请输入要分析的内容"
                />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item
            label="目标关键词"
            name="targetKeywords"
            rules={[{ required: true, message: '请输入目标关键词' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入目标关键词，按回车分隔"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={loading ? <LoadingOutlined /> : <SearchOutlined />}
              loading={loading}
            >
              开始分析
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {analysis && (
        <Card title="分析结果">
          <Tabs defaultActiveKey="overview">
            <TabPane tab="总览" key="overview">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {renderScore(analysis.score)}
              </div>
              <List
                dataSource={[
                  { title: '标题优化', score: analysis.title.score },
                  { title: '描述优化', score: analysis.description.score },
                  { title: '关键词优化', score: analysis.keywords.score },
                  { title: '内容优化', score: analysis.content.score },
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={renderScore(item.score)}
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="标题优化" key="title">
              <Card type="inner" title="当前标题">
                <p>{analysis.title.text}</p>
                <p>长度：{analysis.title.length} 字符</p>
              </Card>
              <Card type="inner" title="优化建议" style={{ marginTop: 16 }}>
                <List
                  dataSource={analysis.title.suggestions}
                  renderItem={item => (
                    <List.Item>{item}</List.Item>
                  )}
                />
              </Card>
            </TabPane>

            <TabPane tab="关键词分析" key="keywords">
              <Card type="inner" title="关键词密度">
                {Object.entries(analysis.keywords.density).map(([keyword, density]) => (
                  <Tag key={keyword} style={{ margin: '0 8px 8px 0' }}>
                    {keyword}: {(density * 100).toFixed(2)}%
                  </Tag>
                ))}
              </Card>
              <Card type="inner" title="关键词建议" style={{ marginTop: 16 }}>
                <List
                  dataSource={analysis.keywords.suggestions}
                  renderItem={item => (
                    <List.Item>{item}</List.Item>
                  )}
                />
              </Card>
            </TabPane>

            <TabPane tab="内容分析" key="content">
              <Card type="inner" title="内容统计">
                <p>字数：{analysis.content.wordCount}</p>
                <p>可读性得分：{analysis.content.readability}</p>
              </Card>
              <Card type="inner" title="改进建议" style={{ marginTop: 16 }}>
                <List
                  dataSource={analysis.content.suggestions}
                  renderItem={item => (
                    <List.Item>{item}</List.Item>
                  )}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default SEO; 