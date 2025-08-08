import { useState, useEffect } from 'react'
import { 
  MessageCircleIcon, 
  BarChart3Icon, 
  ClockIcon,
  SendIcon,
  DownloadIcon,
  RefreshCwIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Agent {
  id: number
  name: string
  model_provider: string
  model_name: string
  is_active: boolean
}

interface Conversation {
  id: number
  agent_id: number
  session_id: string
  user_message: string
  agent_response: string
  response_time?: number
  timestamp: string
}

interface ChatMessage {
  agent_id: number
  message: string
  session_id?: string
}

interface ChatResponse {
  session_id: string
  user_message: string
  agent_response: string
  response_time: number
  timestamp: string
}

interface AgentStats {
  agent_id: number
  agent_name: string
  total_conversations: number
  unique_sessions: number
  average_response_time: number
}

export default function SimulationResults() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [agentStats, setAgentStats] = useState<Record<number, AgentStats>>({})
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'stats'>('chat')

  // 加载agents
  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents/')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.filter((agent: Agent) => agent.is_active))
        if (data.length > 0 && !selectedAgent) {
          setSelectedAgent(data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  // 加载对话历史
  const loadConversations = async (agentId?: number) => {
    try {
      const url = agentId 
        ? `/api/conversations/agent/${agentId}?limit=50`
        : '/api/conversations/?limit=50'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // 加载Agent统计
  const loadAgentStats = async (agentId: number) => {
    try {
      const response = await fetch(`/api/conversations/stats/agent/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setAgentStats(prev => ({ ...prev, [agentId]: data }))
      }
    } catch (error) {
      console.error('Failed to load agent stats:', error)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedAgent || isLoading) return

    setIsLoading(true)
    
    try {
      const chatData: ChatMessage = {
        agent_id: selectedAgent,
        message: currentMessage.trim(),
        session_id: currentSession || undefined
      }

      const response = await fetch('/api/conversations/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      })

      if (response.ok) {
        const result: ChatResponse = await response.json()
        
        // 添加到对话历史
        const newConversation: Conversation = {
          id: Date.now(), // 临时ID
          agent_id: selectedAgent,
          session_id: result.session_id,
          user_message: result.user_message,
          agent_response: result.agent_response,
          response_time: result.response_time,
          timestamp: result.timestamp
        }
        
        setConversations(prev => [newConversation, ...prev])
        setCurrentSession(result.session_id)
        setCurrentMessage('')
        
        // 重新加载统计信息
        loadAgentStats(selectedAgent)
      } else {
        const error = await response.json()
        toast.error(error.detail || '发送消息失败')
      }
    } catch (error) {
      toast.error('发送消息失败')
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 导出RL数据
  const handleExportRLData = async () => {
    try {
      const response = await fetch(`/api/evaluation/export/rl-data?format=json${selectedAgent ? `&agent_id=${selectedAgent}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        
        // 创建下载链接
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rl_data_${selectedAgent ? `agent_${selectedAgent}_` : ''}${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success(`导出成功：${data.count} 条记录`)
      } else {
        toast.error('导出失败')
      }
    } catch (error) {
      toast.error('导出失败')
      console.error('Export error:', error)
    }
  }

  // 格式化响应时间
  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A'
    return `${time.toFixed(2)}s`
  }

  // 新建会话
  const handleNewSession = () => {
    setCurrentSession(null)
    toast.success('已开始新会话')
  }

  useEffect(() => {
    loadAgents()
  }, [])

  useEffect(() => {
    if (selectedAgent) {
      loadConversations(selectedAgent)
      loadAgentStats(selectedAgent)
    }
  }, [selectedAgent])

  const selectedAgentData = agents.find(a => a.id === selectedAgent)
  const selectedAgentStats = selectedAgent ? agentStats[selectedAgent] : null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仿真结果</h1>
          <p className="text-gray-600 mt-1">测试Agent对话能力和查看结果</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => loadConversations(selectedAgent || undefined)}
            className="btn btn-outline"
          >
            <RefreshCwIcon className="h-5 w-5 mr-2" />
            刷新
          </button>
          <button
            onClick={handleExportRLData}
            className="btn btn-primary"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            导出RL数据
          </button>
        </div>
      </div>

      {/* Agent Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">选择Agent</h2>
        </div>
        <div className="card-body">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAgent === agent.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  {selectedAgent === agent.id && (
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {agent.model_provider} / {agent.model_name}
                </p>
                {selectedAgentStats && (
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedAgentStats.total_conversations} 次对话
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              没有可用的Agent，请先创建Agent
            </div>
          )}
        </div>
      </div>

      {selectedAgent && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                          {[
              { id: 'chat', name: '对话测试', icon: MessageCircleIcon },
              { id: 'history', name: '对话历史', icon: ClockIcon },
              { id: 'stats', name: '统计信息', icon: BarChart3Icon },
            ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chat Interface */}
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      与 {selectedAgentData?.name} 对话
                    </h3>
                    <button
                      onClick={handleNewSession}
                      className="btn btn-sm btn-outline"
                    >
                      新会话
                    </button>
                  </div>
                  {currentSession && (
                    <p className="text-sm text-gray-500 mt-1">
                      会话ID: {currentSession.slice(0, 8)}...
                    </p>
                  )}
                </div>
                
                <div className="card-body">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        输入你的问题
                      </label>
                      <textarea
                        rows={4}
                        className="textarea"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="请输入你想问的问题..."
                        disabled={isLoading}
                      />
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="btn btn-primary w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          发送中...
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-5 w-5 mr-2" />
                          发送消息
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Conversation */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">最近对话</h3>
                </div>
                <div className="card-body p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {conversations.slice(0, 5).map((conv, index) => (
                      <div key={conv.id} className={`p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">用户</div>
                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {conv.user_message}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {selectedAgentData?.name}
                            </div>
                            <div className="text-sm text-gray-700 bg-primary-50 p-3 rounded-lg">
                              {conv.agent_response}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{new Date(conv.timestamp).toLocaleString()}</span>
                            <span>响应时间: {formatResponseTime(conv.response_time)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {conversations.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        还没有对话记录
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">对话历史</h3>
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-200">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              用户问题
                            </div>
                            <div className="text-sm text-gray-700">
                              {conv.user_message}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {new Date(conv.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Agent回复
                          </div>
                          <div className="text-sm text-gray-700">
                            {conv.agent_response}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>会话: {conv.session_id.slice(0, 8)}...</span>
                          <span>响应时间: {formatResponseTime(conv.response_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {conversations.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      还没有对话记录
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && selectedAgentStats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="card">
                <div className="card-body text-center">
                  <MessageCircleIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedAgentStats.total_conversations}
                  </div>
                  <div className="text-sm text-gray-600">总对话数</div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <ClockIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedAgentStats.average_response_time.toFixed(2)}s
                  </div>
                  <div className="text-sm text-gray-600">平均响应时间</div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <BarChart3Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedAgentStats.unique_sessions}
                  </div>
                  <div className="text-sm text-gray-600">独立会话数</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
