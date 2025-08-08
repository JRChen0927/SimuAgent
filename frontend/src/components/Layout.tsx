import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  DatabaseIcon, 
  CogIcon, 
  BarChart3Icon, 
  SettingsIcon,
  BrainIcon
} from 'lucide-react'
import { useI18n } from '@/locales'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { t } = useI18n()

  const navigation = [
    { name: t('nav.dataManagement'), href: '/data', icon: DatabaseIcon },
    { name: t('nav.simulationConfig'), href: '/config', icon: CogIcon },
    { name: t('nav.simulationResults'), href: '/results', icon: BarChart3Icon },
    { name: t('nav.systemSettings'), href: '/settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <BrainIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('layout.title')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('layout.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('layout.version', { version: '0.1.0' })}
              </div>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || 
                              (item.href === '/data' && location.pathname === '/')
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <div className="font-medium">{t('layout.systemStatus')}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {t('layout.running')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container-fluid py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
