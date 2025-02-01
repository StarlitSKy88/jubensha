import React, { useState } from 'react';
import { Layout, Menu, Button, Card, Row, Col } from 'antd';
import {
  FileAddOutlined,
  ImportOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import styles from './Workspace.module.css';

const { Sider, Content } = Layout;

const Workspace: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('recent');

  const menuItems = [
    { key: 'recent', icon: <AppstoreOutlined />, label: '最近项目' },
    { key: 'all', icon: <AppstoreOutlined />, label: '全部项目' },
    { key: 'template', icon: <AppstoreOutlined />, label: '模板中心' },
  ];

  const projects = [
    { id: 1, title: '项目1', description: '这是项目1的描述' },
    { id: 2, title: '项目2', description: '这是项目2的描述' },
    { id: 3, title: '项目3', description: '这是项目3的描述' },
  ];

  return (
    <Layout className={styles.workspace}>
      <Sider width={200} theme="light" className={styles.sider}>
        <div className={styles.actions}>
          <Button type="primary" icon={<FileAddOutlined />} block>
            新建项目
          </Button>
          <Button icon={<ImportOutlined />} block className={styles.importBtn}>
            导入项目
          </Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Content className={styles.content}>
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                title={project.title}
                className={styles.projectCard}
              >
                <p>{project.description}</p>
                <div className={styles.cardActions}>
                  <Button type="link">编辑</Button>
                  <Button type="link">预览</Button>
                  <Button type="link" danger>
                    删除
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default Workspace; 