import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  UploadIcon, 
  FileTextIcon, 
  EyeIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: number
  filename: string
  size: number
  type: string
  upload_time: string
  status: string
  processed: boolean
}

export default function DataManagement() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewFile, setPreviewFile] = useState<{
    filename: string
    content: string
  } | null>(null)

  // 文件上传处理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setFiles(prev => [result, ...prev])
          toast.success(`文件 ${file.name} 上传成功`)
        } else {
          const error = await response.json()
          toast.error(`文件 ${file.name} 上传失败: ${error.detail}`)
        }
      }
    } catch (error) {
      toast.error('文件上传失败')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isUploading
  })

  // 文件预览
  const handlePreview = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}/preview`)
      if (response.ok) {
        const result = await response.json()
        setPreviewFile(result)
      } else {
        toast.error('文件预览失败')
      }
    } catch (error) {
      toast.error('文件预览失败')
      console.error('Preview error:', error)
    }
  }

  // 文件删除
  const handleDelete = async (fileId: number) => {
    if (!confirm('确定要删除这个文件吗？')) return

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId))
        toast.success('文件删除成功')
      } else {
        toast.error('文件删除失败')
      }
    } catch (error) {
      toast.error('文件删除失败')
      console.error('Delete error:', error)
    }
  }

  // 文件处理
  const handleProcess = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}/process`, {
        method: 'POST',
      })

      if (response.ok) {
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'processed', processed: true }
            : file
        ))
        toast.success('文件处理成功')
      } else {
        toast.error('文件处理失败')
      }
    } catch (error) {
      toast.error('文件处理失败')
      console.error('Process error:', error)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 获取状态图标
  const getStatusIcon = (status: string, processed: boolean) => {
    if (processed) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
    
    switch (status) {
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <FileTextIcon className="h-5 w-5 text-gray-400" />
    }
  }

  // 加载文件列表
  React.useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch('/api/files/')
        if (response.ok) {
          const result = await response.json()
          setFiles(result)
        }
      } catch (error) {
        console.error('Failed to load files:', error)
      }
    }
    
    loadFiles()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
          <p className="text-gray-600 mt-1">上传和管理知识库文件</p>
        </div>
        <div className="text-sm text-gray-500">
          已上传 {files.length} 个文件
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-body">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            
            {isUploading ? (
              <div className="space-y-2">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-gray-600">上传中...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  拖拽文件到这里，或点击选择文件
                </p>
                <p className="text-gray-500">
                  支持格式：TXT, JSON, PDF, CSV, MD, DOCX
                </p>
                <p className="text-sm text-gray-400">
                  最大文件大小：50MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">文件列表</h2>
        </div>
        <div className="card-body p-0">
          {files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              还没有上传任何文件
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(file.status, file.processed)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {file.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(file.upload_time).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Status Badge */}
                      <span className={`badge ${
                        file.processed 
                          ? 'badge-success' 
                          : file.status === 'processing' 
                            ? 'badge-warning'
                            : file.status === 'error'
                              ? 'badge-danger'
                              : 'badge-secondary'
                      }`}>
                        {file.processed ? '已处理' : 
                         file.status === 'processing' ? '处理中' :
                         file.status === 'error' ? '错误' : '未处理'}
                      </span>
                      
                      {/* Action Buttons */}
                      <button
                        onClick={() => handlePreview(file.id)}
                        className="btn btn-sm btn-outline"
                        title="预览文件"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {!file.processed && file.status !== 'processing' && (
                        <button
                          onClick={() => handleProcess(file.id)}
                          className="btn btn-sm btn-primary"
                          title="处理文件"
                        >
                          处理
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="btn btn-sm btn-danger"
                        title="删除文件"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                文件预览 - {previewFile.filename}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="btn btn-sm btn-outline"
              >
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {previewFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
