import React, { useState, useEffect } from 'react'
import { 
  BrainIcon, 
  PlusIcon,
  EditIcon,
  TrashIcon,
  CopyIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Agent {
  id: number
  name: string
  description?: string
  prompt: string
  model_provider: string
  model_name: string
  temperature: number
  max_tokens: number
  created_time: string
  is_active: boolean
}

interface Model {
  name: string
  display_name: string
  description: string
  enabled: boolean
}

interface AgentFormData {
  name: string
  description: string
  prompt: string
  model_provider: string
  model_name: string
  temperature: number
  max_tokens: number
}

export default function SimulationConfig() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [availableModels, setAvailableModels] = useState<Record<string, Model[]>>({})
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    prompt: '你是一个专业的AI助手，基于提供的知识库回答用户问题。请确保回答准确、有用且友好。',
    model_provider: 'ollama',
    model_name: '',
    temperature: 0.7,
    max_tokens: 1000
  })

  // 加载agents
  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents/')
      if (response.ok) {
        const data = await response.json()
        setAgents(data)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  // 加载可用模型
  const loadModels = async () => {
    try {
      const response = await fetch('/api/config/models')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.providers)
        
        // 设置默认模型
        const defaultProvider = data.default_provider || 'ollama'
        const providerModels = data.providers[defaultProvider]?.models || []
        const enabledModels = providerModels.filter((m: Model) => m.enabled)
        
        if (enabledModels.length > 0) {
          setFormData(prev => ({
            ...prev,
            model_provider: defaultProvider,
            model_name: enabledModels[0].name
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  // 创建/更新Agent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAgent 
        ? `/api/agents/${editingAgent.id}`
        : '/api/agents/'
      
      const method = editingAgent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingAgent ? 'Agent更新成功' : 'Agent创建成功')
        setShowAgentForm(false)
        setEditingAgent(null)
        resetForm()
        loadAgents()
      } else {
        const error = await response.json()
        toast.error(error.detail || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
      console.error('Submit error:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prompt: '你是一个专业的AI助手，基于提供的知识库回答用户问题。请确保回答准确、有用且友好。',
      model_provider: 'ollama',
      model_name: '',
      temperature: 0.7,
      max_tokens: 1000
    })
  }

  // 编辑Agent
  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description || '',
      prompt: agent.prompt,
      model_provider: agent.model_provider,
      model_name: agent.model_name,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens
    })
    setShowAgentForm(true)
  }

  // 删除Agent
  const handleDelete = async (agentId: number) => {
    if (!confirm('确定要删除这个Agent吗？')) return

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Agent删除成功')
        loadAgents()
      } else {
        toast.error('Agent删除失败')
      }
    } catch (error) {
      toast.error('Agent删除失败')
      console.error('Delete error:', error)
    }
  }

  // 克隆Agent
  const handleClone = async (agentId: number) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/clone`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Agent克隆成功')
        loadAgents()
      } else {
        toast.error('Agent克隆失败')
      }
    } catch (error) {
      toast.error('Agent克隆失败')
      console.error('Clone error:', error)
    }
  }

  // 获取提供商的可用模型
  const getProviderModels = (provider: string) => {
    return availableModels[provider]?.filter(model => model.enabled) || []
  }

  useEffect(() => {
    loadAgents()
    loadModels()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仿真配置</h1>
          <p className="text-gray-600 mt-1">配置和管理你的Agent</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingAgent(null)
            setShowAgentForm(true)
          }}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          创建Agent
        </button>
      </div>

      {/* Agent Form Modal */}
      {showAgentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAgent ? '编辑Agent' : '创建新Agent'}
              </h2>
              <button
                onClick={() => setShowAgentForm(false)}
                className="btn btn-sm btn-outline"
              >
                取消
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent名称 *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入Agent名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入Agent描述"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模型提供商
                  </label>
                  <select
                    className="input"
                    value={formData.model_provider}
                    onChange={(e) => {
                      const provider = e.target.value
                      const models = getProviderModels(provider)
                      setFormData(prev => ({ 
                        ...prev, 
                        model_provider: provider,
                        model_name: models.length > 0 ? models[0].name : ''
                      }))
                    }}
                  >
                    {Object.keys(availableModels).map(provider => (
                      <option key={provider} value={provider}>
                        {provider.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模型
                  </label>
                  <select
                    className="input"
                    value={formData.model_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                  >
                    {getProviderModels(formData.model_provider).map(model => (
                      <option key={model.name} value={model.name}>
                        {model.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>更保守</span>
                    <span>更创造性</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大Token数
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    className="input"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  系统提示词 *
                </label>
                <textarea
                  required
                  rows={6}
                  className="textarea"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="请输入Agent的角色设定和指令..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAgentForm(false)}
                  className="btn btn-outline"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingAgent ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainIcon className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {agent.name}
                  </h3>
                </div>
                <span className={`badge ${agent.is_active ? 'badge-success' : 'badge-secondary'}`}>
                  {agent.is_active ? '活跃' : '禁用'}
                </span>
              </div>
              {agent.description && (
                <p className="text-sm text-gray-600 mt-1 text-truncate-2">
                  {agent.description}
                </p>
              )}
            </div>
            
            <div className="card-body">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">模型</span>
                  <p className="text-sm text-gray-900">
                    {agent.model_provider} / {agent.model_name}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Temperature</span>
                    <p className="text-sm text-gray-900">{agent.temperature}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Max Tokens</span>
                    <p className="text-sm text-gray-900">{agent.max_tokens}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500">提示词预览</span>
                  <p className="text-sm text-gray-700 text-truncate-3 mt-1">
                    {agent.prompt}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  创建于 {new Date(agent.created_time).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="btn btn-sm btn-outline"
                    title="编辑"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleClone(agent.id)}
                    className="btn btn-sm btn-outline"
                    title="克隆"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="btn btn-sm btn-danger"
                    title="删除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {agents.length === 0 && (
          <div className="col-span-full">
            <div className="card">
              <div className="card-body text-center py-8">
                <BrainIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有创建任何Agent
                </h3>
                <p className="text-gray-600 mb-4">
                  创建你的第一个Agent来开始仿真测试
                </p>
                <button
                  onClick={() => {
                    resetForm()
                    setEditingAgent(null)
                    setShowAgentForm(true)
                  }}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  创建Agent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
