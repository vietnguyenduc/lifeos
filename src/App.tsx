import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Finance from './pages/Finance'
import Career from './pages/Career'
import People from './pages/People'
import Decisions from './pages/Decisions'
import TimeEnergy from './pages/TimeEnergy'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="finance" element={<Finance />} />
            <Route path="career" element={<Career />} />
            <Route path="people" element={<People />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="time-energy" element={<TimeEnergy />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
