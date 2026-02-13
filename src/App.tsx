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
import Skills from './pages/Skills'
import Vocabulary from './pages/Vocabulary'
import Moments from './pages/Moments'
import Login from './pages/Login.tsx'
import { useAuth } from './contexts/AuthContext'

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Login />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="finance" element={<Finance />} />
            <Route path="career" element={<Career />} />
            <Route path="people" element={<People />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="time-energy" element={<TimeEnergy />} />
            <Route path="skills" element={<Skills />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="moments" element={<Moments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
