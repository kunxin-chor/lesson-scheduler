import { Router, Route } from 'wouter'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LessonPlansPage from './pages/LessonPlansPage'
import IntakesPage from './pages/IntakesPage';
import StudentIntakesPage from './pages/student/StudentIntakesPage';
import StudentSlotsPage from './pages/student/StudentSlotsPage';
import './App.css'

function App() {
  return (
    <div className="app">
      <Router>
        <Navigation />
        
        <main className="app-main">
          <Route path="/" component={HomePage} />
          <Route path="/lesson-plans" component={LessonPlansPage} />
          <Route path="/lesson-plans/:planId" component={LessonPlansPage} />
                    <Route path="/intakes" component={IntakesPage} />
          <Route path="/students/intakes" component={StudentIntakesPage} />
          <Route path="/students/intakes/:id" component={StudentSlotsPage} />
        </main>
      </Router>
    </div>
  )
}

export default App
