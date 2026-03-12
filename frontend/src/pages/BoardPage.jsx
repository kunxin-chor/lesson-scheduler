import { useState } from 'react'
import { Container } from 'react-bootstrap'
import LessonBoard from '../LessonBoard'

function BoardPage() {
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])

  const handleLessonsUpdate = (updatedLessons) => {
    setLessons(updatedLessons)
    console.log('Lessons updated:', updatedLessons)
  }

  const handleModulesUpdate = (updatedModules) => {
    setModules(updatedModules)
    console.log('Modules updated:', updatedModules)
  }

  return (
    <Container fluid className="py-4">
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold">Lesson Board</h1>
        <p className="lead text-muted">
          Organize your lessons by dragging cards between modules
        </p>
      </div>
      
      <LessonBoard 
        lessons={lessons}
        modules={modules}
        onLessonsUpdate={handleLessonsUpdate}
        onModulesUpdate={handleModulesUpdate}
        editable={true}
      />
    </Container>
  )
}

export default BoardPage
