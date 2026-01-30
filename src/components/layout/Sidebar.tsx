import { Link } from 'react-router-dom'

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          <li><Link to="/" className="block p-2 rounded hover:bg-gray-200">Dashboard</Link></li>
          <li><Link to="/finance" className="block p-2 rounded hover:bg-gray-200">Finance</Link></li>
          <li><Link to="/career" className="block p-2 rounded hover:bg-gray-200">Career</Link></li>
          <li><Link to="/people" className="block p-2 rounded hover:bg-gray-200">People</Link></li>
          <li><Link to="/decisions" className="block p-2 rounded hover:bg-gray-200">Decisions</Link></li>
          <li><Link to="/time-energy" className="block p-2 rounded hover:bg-gray-200">Time & Energy</Link></li>
          <li><Link to="/settings" className="block p-2 rounded hover:bg-gray-200">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
