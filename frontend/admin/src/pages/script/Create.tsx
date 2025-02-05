import React, { useState } from 'react';
import { Card, Form, Input, Button, Steps, message, Tabs } from 'antd';
import { SendOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

interface ScriptForm {
  title: string;
  theme: string;
  synopsis: string;
  playerCount: string;
  duration: string;
  difficulty: string;
}

const Create: React.FC = () => {
  const [form] = Form.useForm<ScriptForm>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scriptData, setScriptData] = useState<any>(null);

  const handleGenerate = async (values: ScriptForm) => {
    setLoading(true);
    try {
      // TODO: 调用 API 生成剧本
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      setScriptData(data);
      message.success('剧本生成成功！');
      setCurrentStep(1);
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: 保存剧本
      await fetch('/api/script/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scriptData),
      });
      message.success('保存成功！');
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };

  return (
    <div className="script-creator">
      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[
          {
            title: '创意发想',
            description: '输入创作构思',
          },
          {
            title: '剧本生成',
            description: '智能生成剧本',
          },
          {
            title: '完善调整',
            description: '修改和优化',
          },
        ]}
      />

      {currentStep === 0 && (
        <Card title="创意构思">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
          >
            <Form.Item
              label="剧本标题"
              name="title"
              rules={[{ required: true, message: '请输入剧本标题' }]}
            >
              <Input placeholder="请输入剧本标题" />
            </Form.Item>

            <Form.Item
              label="主题类型"
              name="theme"
              rules={[{ required: true, message: '请输入主题类型' }]}
            >
              <Input placeholder="例如：推理、悬疑、恐怖、情感等" />
            </Form.Item>

            <Form.Item
              label="故事梗概"
              name="synopsis"
              rules={[{ required: true, message: '请输入故事梗概' }]}
            >
              <TextArea
                rows={6}
                placeholder="请输入故事梗概，包括背景设定、主要人物、核心事件等"
              />
            </Form.Item>

            <Form.Item
              label="游戏人数"
              name="playerCount"
              rules={[{ required: true, message: '请输入游戏人数' }]}
            >
              <Input placeholder="例如：6-8人" />
            </Form.Item>

            <Form.Item
              label="游戏时长"
              name="duration"
              rules={[{ required: true, message: '请输入预计游戏时长' }]}
            >
              <Input placeholder="例如：3-4小时" />
            </Form.Item>

            <Form.Item
              label="难度系数"
              name="difficulty"
              rules={[{ required: true, message: '请输入难度系数' }]}
            >
              <Input placeholder="例如：简单、中等、困难" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                loading={loading}
              >
                生成剧本
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {currentStep === 1 && scriptData && (
        <Card
          title="剧本内容"
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存剧本
            </Button>
          }
        >
          <Tabs defaultActiveKey="outline">
            <TabPane tab="剧情大纲" key="outline">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {scriptData.outline}
              </div>
            </TabPane>
            <TabPane tab="人物设定" key="characters">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {scriptData.characters}
              </div>
            </TabPane>
            <TabPane tab="线索卡片" key="clues">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {scriptData.clues}
              </div>
            </TabPane>
            <TabPane tab="主持人手册" key="dm">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {scriptData.dmScript}
              </div>
            </TabPane>
            <TabPane tab="玩家剧本" key="players">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {scriptData.playerScripts}
              </div>
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default Create; 