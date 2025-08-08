export const zh = {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    update: '更新',
    confirm: '确认',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    yes: '是',
    no: '否',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    refresh: '刷新',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    upload: '上传',
    download: '下载',
    export: '导出',
    import: '导入',
    copy: '复制',
    clone: '克隆',
    preview: '预览',
    status: '状态',
    settings: '设置'
  },

  // 导航
  nav: {
    dataManagement: '数据管理',
    simulationConfig: '仿真配置',
    simulationResults: '仿真结果',
    systemSettings: '系统设置'
  },

  // 布局
  layout: {
    title: 'SimuAgent',
    subtitle: 'Agent平台仿真',
    version: '版本 {{version}}',
    systemStatus: '系统状态',
    running: '运行正常'
  },

  // 数据管理
  dataManagement: {
    title: '数据管理',
    subtitle: '上传和管理知识库文件',
    uploadArea: {
      title: '拖拽文件到这里，或点击选择文件',
      subtitle: '支持格式：TXT, JSON, PDF, CSV, MD, DOCX',
      maxSize: '最大文件大小：50MB',
      uploading: '上传中...'
    },
    fileList: {
      title: '文件列表',
      empty: '还没有上传任何文件',
      filename: '文件名',
      size: '大小',
      type: '类型',
      uploadTime: '上传时间',
      status: '状态',
      actions: '操作'
    },
    status: {
      uploaded: '已上传',
      processing: '处理中',
      processed: '已处理',
      error: '错误'
    },
    actions: {
      preview: '预览',
      process: '处理',
      delete: '删除'
    },
    messages: {
      uploadSuccess: '文件 {{filename}} 上传成功',
      uploadFailed: '文件 {{filename}} 上传失败：{{error}}',
      deleteSuccess: '文件删除成功',
      deleteFailed: '文件删除失败',
      processSuccess: '文件处理成功',
      processFailed: '文件处理失败',
      previewFailed: '文件预览失败',
      deleteConfirm: '确定要删除这个文件吗？'
    }
  },

  // 仿真配置
  simulationConfig: {
    title: '仿真配置',
    subtitle: '配置和管理你的Agent',
    createAgent: '创建Agent',
    editAgent: '编辑Agent',
    agentForm: {
      name: 'Agent名称',
      namePlaceholder: '请输入Agent名称',
      nameRequired: 'Agent名称是必需的',
      description: '描述',
      descriptionPlaceholder: '请输入Agent描述',
      modelProvider: '模型提供商',
      model: '模型',
      temperature: 'Temperature ({{value}})',
      temperatureHelper: '更保守 ← → 更创造性',
      maxTokens: '最大Token数',
      systemPrompt: '系统提示词',
      systemPromptRequired: '系统提示词是必需的',
      systemPromptPlaceholder: '请输入Agent的角色设定和指令...'
    },
    agentCard: {
      active: '活跃',
      inactive: '禁用',
      model: '模型',
      temperature: 'Temperature',
      maxTokens: '最大Token数',
      promptPreview: '提示词预览',
      createdAt: '创建于 {{date}}'
    },
    actions: {
      edit: '编辑',
      clone: '克隆',
      delete: '删除'
    },
    emptyState: {
      title: '还没有创建任何Agent',
      subtitle: '创建你的第一个Agent来开始仿真测试',
      createButton: '创建Agent'
    },
    messages: {
      createSuccess: 'Agent创建成功',
      updateSuccess: 'Agent更新成功',
      deleteSuccess: 'Agent删除成功',
      cloneSuccess: 'Agent克隆成功',
      createFailed: 'Agent创建失败',
      updateFailed: 'Agent更新失败',
      deleteFailed: 'Agent删除失败',
      cloneFailed: 'Agent克隆失败',
      deleteConfirm: '确定要删除这个Agent吗？'
    }
  },

  // 仿真结果
  simulationResults: {
    title: '仿真结果',
    subtitle: '测试Agent对话能力和查看结果',
    selectAgent: '选择Agent',
    tabs: {
      chat: '对话测试',
      history: '对话历史',
      stats: '统计信息'
    },
    chat: {
      title: '与 {{agentName}} 对话',
      newSession: '新会话',
      sessionId: '会话ID：{{id}}',
      inputPlaceholder: '请输入你想问的问题...',
      sendMessage: '发送消息',
      sending: '发送中...',
      recentConversations: '最近对话',
      user: '用户',
      responseTime: '响应时间：{{time}}'
    },
    history: {
      title: '对话历史',
      empty: '还没有对话记录',
      userQuestion: '用户问题',
      agentResponse: 'Agent回复',
      session: '会话：{{id}}',
      responseTime: '响应时间：{{time}}'
    },
    stats: {
      title: '统计信息',
      totalConversations: '总对话数',
      averageResponseTime: '平均响应时间',
      uniqueSessions: '独立会话数'
    },
    actions: {
      refresh: '刷新',
      exportRL: '导出RL数据',
      newSession: '新会话'
    },
    messages: {
      chatSuccess: '消息发送成功',
      chatFailed: '消息发送失败',
      exportSuccess: '导出成功：{{count}} 条记录',
      exportFailed: '导出失败',
      newSessionSuccess: '已开始新会话'
    }
  },

  // 系统设置
  systemSettings: {
    title: '系统设置',
    subtitle: '配置模型、存储和Agent默认参数',
    tabs: {
      models: '模型配置',
      storage: '存储配置',
      agent: 'Agent默认设置'
    },
    models: {
      defaultProvider: '默认模型提供商',
      providerModels: '{{provider}} 模型',
      modelName: '模型名称：{{name}}',
      enabled: '启用',
      disabled: '禁用',
      noModels: '没有配置模型',
      toggle: '切换模型状态'
    },
    storage: {
      uploadDir: '上传目录',
      processedDir: '处理目录',
      maxFileSize: '最大文件大小',
      supportedFormats: '支持的文件格式'
    },
    agent: {
      defaultPrompt: '默认提示词',
      maxContextLength: '最大上下文长度',
      temperature: 'Temperature',
      topP: 'Top P'
    },
    actions: {
      reload: '重新加载',
      save: '保存配置',
      saving: '保存中...'
    },
    messages: {
      saveSuccess: '配置保存成功',
      saveFailed: '配置保存失败',
      reloadSuccess: '配置重新加载成功',
      reloadFailed: '配置重新加载失败',
      loadFailed: '加载配置失败'
    }
  },

  // 默认提示词
  prompts: {
    defaultAgent: '你是一个专业的AI助手，基于提供的知识库回答用户问题。请确保回答准确、有用且友好。',
    systemInstructions: '你是一个智能AI助手。请遵循以下准则：\n1. 提供准确有用的信息\n2. 保持友好和专业\n3. 在可用时使用知识库\n4. 需要时询问澄清'
  },

  // 主题和UI
  theme: {
    light: '浅色模式',
    dark: '深色模式',
    toggle: '切换主题'
  },

  // 语言
  language: {
    english: 'English',
    chinese: '中文',
    toggle: '切换语言'
  },

  // 错误消息
  errors: {
    networkError: '网络错误，请重试',
    serverError: '服务器错误，请联系管理员',
    validationError: '输入验证失败',
    notFound: '资源未找到',
    unauthorized: '未授权访问',
    forbidden: '访问被禁止',
    fileTooBig: '文件大小超出限制',
    invalidFormat: '无效的文件格式',
    uploadFailed: '文件上传失败'
  },

  // 成功消息
  success: {
    operationCompleted: '操作成功完成',
    saved: '保存成功',
    deleted: '删除成功',
    updated: '更新成功',
    created: '创建成功'
  }
}
