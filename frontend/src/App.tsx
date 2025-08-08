import { Routes, Route } from 'react-router-dom'
import Providers from '@/components/Providers'
import Layout from '@/components/Layout'
import DataManagement from '@/pages/DataManagement'
import SimulationConfig from '@/pages/SimulationConfig'
import SimulationResults from '@/pages/SimulationResults'
import Settings from '@/pages/Settings'

function App() {
  return (
    <Providers>
      <Layout>
        <Routes>
          <Route path="/" element={<DataManagement />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/config" element={<SimulationConfig />} />
          <Route path="/results" element={<SimulationResults />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Providers>
  )
}

export default App
