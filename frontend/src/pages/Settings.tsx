import { useState, useEffect } from 'react'
import { 
  SaveIcon, 
  RefreshCwIcon,
  ToggleLeftIcon,
  ToggleRightIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Model {
  name: string
  display_name: string
  description: string
  enabled: boolean
}

interface ConfigData {
  models: {
    default_provider: string
    providers: Record<string, {
      base_url?: string
      models: Model[]
    }>
  }
  storage: {
    upload_dir: string
    processed_dir: string
    max_file_size: string
    supported_formats: string[]
  }
  agent: {
    default_prompt: string
    max_context_length: number
    temperature: number
    top_p: number
  }
}

export default function Settings() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'models' | 'storage' | 'agent'>('models')

  // 加载配置
  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config/')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        toast.error('加载配置失败')
      }
    } catch (error) {
      toast.error('加载配置失败')
      console.error('Load config error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 保存配置
  const saveConfig = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/config/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success('配置保存成功')
      } else {
        const error = await response.json()
        toast.error(error.detail || '配置保存失败')
      }
    } catch (error) {
      toast.error('配置保存失败')
      console.error('Save config error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 切换模型状态
  const toggleModel = async (provider: string, modelName: string) => {
    if (!config) return

    try {
      const response = await fetch(`/api/config/models/${provider}/${modelName}/toggle`, {
        method: 'POST',
      })

      if (response.ok) {
        // 更新本地状态
        setConfig(prev => {
          if (!prev) return prev
          const newConfig = { ...prev }
          const models = newConfig.models.providers[provider]?.models || []
          const modelIndex = models.findIndex(m => m.name === modelName)
          if (modelIndex >= 0) {
            models[modelIndex].enabled = !models[modelIndex].enabled
          }
          return newConfig
        })
        toast.success('模型状态更新成功')
      } else {
        toast.error('模型状态更新失败')
      }
    } catch (error) {
      toast.error('模型状态更新失败')
      console.error('Toggle model error:', error)
    }
  }

  // 重新加载配置
  const reloadConfig = async () => {
    try {
      const response = await fetch('/api/config/reload', {
        method: 'POST',
      })

      if (response.ok) {
        await loadConfig()
        toast.success('配置重新加载成功')
      } else {
        toast.error('配置重新加载失败')
      }
    } catch (error) {
      toast.error('配置重新加载失败')
      console.error('Reload config error:', error)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span>加载配置中...</span>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-8 text-gray-500">
        配置加载失败
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">配置模型、存储和Agent默认参数</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={reloadConfig}
            className="btn btn-outline"
          >
            <RefreshCwIcon className="h-5 w-5 mr-2" />
            重新加载
          </button>
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <div className="loading-spinner mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <SaveIcon className="h-5 w-5 mr-2" />
                保存配置
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'models', name: '模型配置' },
            { id: 'storage', name: '存储配置' },
            { id: 'agent', name: 'Agent默认设置' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">默认模型提供商</h3>
            </div>
            <div className="card-body">
              <select
                className="input max-w-xs"
                value={config.models.default_provider}
                onChange={(e) => setConfig(prev => prev ? {
                  ...prev,
                  models: { ...prev.models, default_provider: e.target.value }
                } : prev)}
              >
                {Object.keys(config.models.providers).map(provider => (
                  <option key={provider} value={provider}>
                    {provider.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {Object.entries(config.models.providers).map(([provider, providerConfig]) => (
            <div key={provider} className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {provider.toUpperCase()} 模型
                  </h3>
                  {providerConfig.base_url && (
                    <span className="text-sm text-gray-500">
                      {providerConfig.base_url}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-200">
                  {providerConfig.models.map((model) => (
                    <div key={model.name} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {model.display_name}
                          </h4>
                          <span className={`badge ${model.enabled ? 'badge-success' : 'badge-secondary'}`}>
                            {model.enabled ? '启用' : '禁用'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {model.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          模型名称: {model.name}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleModel(provider, model.name)}
                        className="ml-4"
                      >
                        {model.enabled ? (
                          <ToggleRightIcon className="h-6 w-6 text-primary-600" />
                        ) : (
                          <ToggleLeftIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                  
                  {providerConfig.models.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      没有配置模型
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">存储路径</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  上传目录
                </label>
                <input
                  type="text"
                  className="input"
                  value={config.storage.upload_dir}
                  onChange={(e) => setConfig(prev => prev ? {
                    ...prev,
                    storage: { ...prev.storage, upload_dir: e.target.value }
                  } : prev)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  处理目录
                </label>
                <input
                  type="text"
                  className="input"
                  value={config.storage.processed_dir}
                  onChange={(e) => setConfig(prev => prev ? {
                    ...prev,
                    storage: { ...prev.storage, processed_dir: e.target.value }
                  } : prev)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大文件大小
                </label>
                <input
                  type="text"
                  className="input"
                  value={config.storage.max_file_size}
                  onChange={(e) => setConfig(prev => prev ? {
                    ...prev,
                    storage: { ...prev.storage, max_file_size: e.target.value }
                  } : prev)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">支持的文件格式</h3>
            </div>
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                {config.storage.supported_formats.map((format) => (
                  <span key={format} className="badge badge-primary">
                    .{format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Tab */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">默认参数</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  默认提示词
                </label>
                <textarea
                  rows={4}
                  className="textarea"
                  value={config.agent.default_prompt}
                  onChange={(e) => setConfig(prev => prev ? {
                    ...prev,
                    agent: { ...prev.agent, default_prompt: e.target.value }
                  } : prev)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大上下文长度
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={config.agent.max_context_length}
                    onChange={(e) => setConfig(prev => prev ? {
                      ...prev,
                      agent: { ...prev.agent, max_context_length: parseInt(e.target.value) }
                    } : prev)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    className="input"
                    value={config.agent.temperature}
                    onChange={(e) => setConfig(prev => prev ? {
                      ...prev,
                      agent: { ...prev.agent, temperature: parseFloat(e.target.value) }
                    } : prev)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top P
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="input"
                    value={config.agent.top_p}
                    onChange={(e) => setConfig(prev => prev ? {
                      ...prev,
                      agent: { ...prev.agent, top_p: parseFloat(e.target.value) }
                    } : prev)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
