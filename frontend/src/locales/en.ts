export const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    upload: 'Upload',
    download: 'Download',
    export: 'Export',
    import: 'Import',
    copy: 'Copy',
    clone: 'Clone',
    preview: 'Preview',
    status: 'Status',
    settings: 'Settings'
  },

  // Navigation
  nav: {
    dataManagement: 'Data Management',
    simulationConfig: 'Simulation Config',
    simulationResults: 'Results',
    systemSettings: 'Settings'
  },

  // Layout
  layout: {
    title: 'SimuAgent',
    subtitle: 'Agent Platform Simulation',
    version: 'Version {{version}}',
    systemStatus: 'System Status',
    running: 'Running'
  },

  // Data Management
  dataManagement: {
    title: 'Data Management',
    subtitle: 'Upload and manage knowledge base files',
    uploadArea: {
      title: 'Drag files here, or click to select files',
      subtitle: 'Supported formats: TXT, JSON, PDF, CSV, MD, DOCX',
      maxSize: 'Maximum file size: 50MB',
      uploading: 'Uploading...'
    },
    fileList: {
      title: 'File List',
      empty: 'No files uploaded yet',
      filename: 'Filename',
      size: 'Size',
      type: 'Type',
      uploadTime: 'Upload Time',
      status: 'Status',
      actions: 'Actions'
    },
    status: {
      uploaded: 'Uploaded',
      processing: 'Processing',
      processed: 'Processed',
      error: 'Error'
    },
    actions: {
      preview: 'Preview',
      process: 'Process',
      delete: 'Delete'
    },
    messages: {
      uploadSuccess: 'File {{filename}} uploaded successfully',
      uploadFailed: 'File {{filename}} upload failed: {{error}}',
      deleteSuccess: 'File deleted successfully',
      deleteFailed: 'File deletion failed',
      processSuccess: 'File processed successfully',
      processFailed: 'File processing failed',
      previewFailed: 'File preview failed',
      deleteConfirm: 'Are you sure you want to delete this file?'
    }
  },

  // Simulation Config
  simulationConfig: {
    title: 'Simulation Configuration',
    subtitle: 'Configure and manage your Agents',
    createAgent: 'Create Agent',
    editAgent: 'Edit Agent',
    agentForm: {
      name: 'Agent Name',
      namePlaceholder: 'Enter agent name',
      nameRequired: 'Agent name is required',
      description: 'Description',
      descriptionPlaceholder: 'Enter agent description',
      modelProvider: 'Model Provider',
      model: 'Model',
      temperature: 'Temperature ({{value}})',
      temperatureHelper: 'Lower: More conservative, Higher: More creative',
      maxTokens: 'Max Tokens',
      systemPrompt: 'System Prompt',
      systemPromptRequired: 'System prompt is required',
      systemPromptPlaceholder: 'Enter the agent\'s role and instructions...'
    },
    agentCard: {
      active: 'Active',
      inactive: 'Inactive',
      model: 'Model',
      temperature: 'Temperature',
      maxTokens: 'Max Tokens',
      promptPreview: 'Prompt Preview',
      createdAt: 'Created at {{date}}'
    },
    actions: {
      edit: 'Edit',
      clone: 'Clone',
      delete: 'Delete'
    },
    emptyState: {
      title: 'No Agents Created Yet',
      subtitle: 'Create your first Agent to start simulation testing',
      createButton: 'Create Agent'
    },
    messages: {
      createSuccess: 'Agent created successfully',
      updateSuccess: 'Agent updated successfully',
      deleteSuccess: 'Agent deleted successfully',
      cloneSuccess: 'Agent cloned successfully',
      createFailed: 'Agent creation failed',
      updateFailed: 'Agent update failed',
      deleteFailed: 'Agent deletion failed',
      cloneFailed: 'Agent cloning failed',
      deleteConfirm: 'Are you sure you want to delete this Agent?'
    }
  },

  // Simulation Results
  simulationResults: {
    title: 'Simulation Results',
    subtitle: 'Test Agent conversation capabilities and view results',
    selectAgent: 'Select Agent',
    tabs: {
      chat: 'Chat Test',
      history: 'Conversation History',
      stats: 'Statistics'
    },
    chat: {
      title: 'Chat with {{agentName}}',
      newSession: 'New Session',
      sessionId: 'Session ID: {{id}}',
      inputPlaceholder: 'Enter your question...',
      sendMessage: 'Send Message',
      sending: 'Sending...',
      recentConversations: 'Recent Conversations',
      user: 'User',
      responseTime: 'Response time: {{time}}'
    },
    history: {
      title: 'Conversation History',
      empty: 'No conversation records',
      userQuestion: 'User Question',
      agentResponse: 'Agent Response',
      session: 'Session: {{id}}',
      responseTime: 'Response time: {{time}}'
    },
    stats: {
      title: 'Statistics',
      totalConversations: 'Total Conversations',
      averageResponseTime: 'Average Response Time',
      uniqueSessions: 'Unique Sessions'
    },
    actions: {
      refresh: 'Refresh',
      exportRL: 'Export RL Data',
      newSession: 'New Session'
    },
    messages: {
      chatSuccess: 'Message sent successfully',
      chatFailed: 'Failed to send message',
      exportSuccess: 'Export successful: {{count}} records',
      exportFailed: 'Export failed',
      newSessionSuccess: 'New session started'
    }
  },

  // System Settings
  systemSettings: {
    title: 'System Settings',
    subtitle: 'Configure models, storage, and default Agent parameters',
    tabs: {
      models: 'Model Configuration',
      storage: 'Storage Configuration',
      agent: 'Default Agent Settings'
    },
    models: {
      defaultProvider: 'Default Model Provider',
      providerModels: '{{provider}} Models',
      modelName: 'Model name: {{name}}',
      enabled: 'Enabled',
      disabled: 'Disabled',
      noModels: 'No models configured',
      toggle: 'Toggle model status'
    },
    storage: {
      uploadDir: 'Upload Directory',
      processedDir: 'Processed Directory',
      maxFileSize: 'Maximum File Size',
      supportedFormats: 'Supported File Formats'
    },
    agent: {
      defaultPrompt: 'Default Prompt',
      maxContextLength: 'Max Context Length',
      temperature: 'Temperature',
      topP: 'Top P'
    },
    actions: {
      reload: 'Reload',
      save: 'Save Config',
      saving: 'Saving...'
    },
    messages: {
      saveSuccess: 'Configuration saved successfully',
      saveFailed: 'Configuration save failed',
      reloadSuccess: 'Configuration reloaded successfully',
      reloadFailed: 'Configuration reload failed',
      loadFailed: 'Failed to load configuration'
    }
  },

  // Default prompts
  prompts: {
    defaultAgent: 'You are a professional AI assistant. Based on the provided knowledge base, answer user questions. Please ensure your answers are accurate, helpful, and friendly.',
    systemInstructions: 'You are an intelligent AI assistant. Please follow these guidelines:\n1. Provide accurate and helpful information\n2. Be friendly and professional\n3. Use the knowledge base when available\n4. Ask for clarification when needed'
  },

  // Themes and UI
  theme: {
    light: 'Light Mode',
    dark: 'Dark Mode',
    toggle: 'Toggle Theme'
  },

  // Language
  language: {
    english: 'English',
    chinese: '中文',
    toggle: 'Switch Language'
  },

  // Error messages
  errors: {
    networkError: 'Network error, please try again',
    serverError: 'Server error, please contact administrator',
    validationError: 'Input validation failed',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    fileTooBig: 'File size exceeds limit',
    invalidFormat: 'Invalid file format',
    uploadFailed: 'File upload failed'
  },

  // Success messages
  success: {
    operationCompleted: 'Operation completed successfully',
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully'
  }
}
