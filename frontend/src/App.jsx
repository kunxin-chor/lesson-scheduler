import { Router, Route } from 'wouter'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LessonPlansPage from './pages/LessonPlansPage'
import IntakesPage from './pages/IntakesPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Router>
        <Navigation />
        
        <main className="app-main">
          <Route path="/" component={HomePage} />
          <Route path="/lesson-plans" component={LessonPlansPage} />
          <Route path="/intakes" component={IntakesPage} />
        </main>
      </Router>
    </div>
  )
}

export default App
