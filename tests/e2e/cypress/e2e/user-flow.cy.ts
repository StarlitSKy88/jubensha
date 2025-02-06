describe('User Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('completes registration and login flow', () => {
    // 注册流程
    cy.get('[data-test="register-link"]').click()
    cy.get('[data-test="username-input"]').type('testuser')
    cy.get('[data-test="email-input"]').type('test@example.com')
    cy.get('[data-test="password-input"]').type('Test@123')
    cy.get('[data-test="confirm-password-input"]').type('Test@123')
    cy.get('[data-test="register-button"]').click()
    cy.get('[data-test="success-message"]').should('contain', '注册成功')

    // 登录流程
    cy.get('[data-test="login-link"]').click()
    cy.get('[data-test="username-input"]').type('testuser')
    cy.get('[data-test="password-input"]').type('Test@123')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/workspace')
  })

  it('creates and edits a script', () => {
    // 登录
    cy.login('testuser', 'Test@123')

    // 创建新剧本
    cy.get('[data-test="new-script-button"]').click()
    cy.get('[data-test="script-title-input"]').type('测试剧本')
    cy.get('[data-test="create-script-button"]').click()

    // 编辑剧本
    cy.get('[data-test="editor"]').should('exist')
    cy.get('[data-test="editor-line"]').first().type('第一幕：序章')
    cy.get('[data-test="save-button"]').click()
    cy.get('[data-test="save-success"]').should('be.visible')

    // 使用AI辅助
    cy.get('[data-test="ai-assist-button"]').click()
    cy.get('[data-test="ai-suggestion"]').should('be.visible')
    cy.get('[data-test="apply-suggestion"]').click()
    cy.get('[data-test="editor-line"]').should('contain', '第一幕：序章')
  })

  it('manages script files', () => {
    // 登录
    cy.login('testuser', 'Test@123')

    // 保存文件
    cy.get('[data-test="save-button"]').click()
    cy.get('[data-test="save-success"]').should('be.visible')

    // 导出文件
    cy.get('[data-test="export-button"]').click()
    cy.get('[data-test="export-format"]').select('txt')
    cy.get('[data-test="confirm-export"]').click()
    cy.get('[data-test="export-success"]').should('be.visible')

    // 导入文件
    cy.get('[data-test="import-button"]').click()
    cy.get('[data-test="file-input"]').attachFile('test.txt')
    cy.get('[data-test="confirm-import"]').click()
    cy.get('[data-test="import-success"]').should('be.visible')
  })

  it('handles performance monitoring', () => {
    // 登录
    cy.login('testuser', 'Test@123')

    // 检查性能监控
    cy.get('[data-test="performance-monitor"]').should('exist')
    
    // 加载大文件
    cy.get('[data-test="import-button"]').click()
    cy.get('[data-test="file-input"]').attachFile('large-file.txt')
    cy.get('[data-test="confirm-import"]').click()

    // 验证性能指标
    cy.get('[data-test="load-time"]').should('exist')
    cy.get('[data-test="memory-usage"]').should('exist')
    cy.get('[data-test="cpu-usage"]').should('exist')
  })

  it('handles error scenarios', () => {
    // 登录
    cy.login('testuser', 'Test@123')

    // 模拟网络错误
    cy.intercept('POST', '/api/save', {
      statusCode: 500,
      body: { error: '保存失败' }
    })
    cy.get('[data-test="save-button"]').click()
    cy.get('[data-test="error-message"]').should('contain', '保存失败')

    // 模拟服务器超时
    cy.intercept('GET', '/api/content', {
      forceNetworkError: true
    })
    cy.get('[data-test="load-button"]').click()
    cy.get('[data-test="error-message"]').should('contain', '加载失败')

    // 恢复自动保存
    cy.get('[data-test="retry-button"]').click()
    cy.get('[data-test="save-success"]').should('be.visible')
  })

  it('supports user preferences', () => {
    // 登录
    cy.login('testuser', 'Test@123')

    // 修改主题
    cy.get('[data-test="settings-button"]').click()
    cy.get('[data-test="theme-select"]').select('dark')
    cy.get('body').should('have.class', 'dark-theme')

    // 修改字体
    cy.get('[data-test="font-select"]').select('Microsoft YaHei')
    cy.get('[data-test="editor"]').should('have.css', 'font-family', 'Microsoft YaHei')

    // 修改快捷键
    cy.get('[data-test="shortcuts-tab"]').click()
    cy.get('[data-test="save-shortcut"]').type('{ctrl}s')
    cy.get('[data-test="save-preferences"]').click()
    cy.get('[data-test="save-success"]').should('be.visible')
  })
}) 