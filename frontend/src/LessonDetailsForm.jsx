import { useState } from 'react'
import './TemplateForm.css'

function LessonDetailsForm({ totalLessons, onLessonsSubmit, onCancel }) {
  const [lessons, setLessons] = useState(
    Array.from({ length: totalLessons }, (_, i) => ({
      lessonNumber: i + 1,
      title: `Lesson ${i + 1}`,
      prelearningMaterials: '',
      guidedInstructions: '',
      handsOnActivities: ''
    }))
  )

  const [bulkTemplates, setBulkTemplates] = useState({
    prelearning: '',
    guided: '',
    handsOn: ''
  })

  const handleLessonChange = (lessonIndex, field, value) => {
    setLessons(prev => {
      const newLessons = [...prev]
      newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value }
      return newLessons
    })
  }

  const handleBulkTemplateChange = (field, value) => {
    setBulkTemplates(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onLessonsSubmit(lessons)
  }

  const handleBulkFill = (field) => {
    const template = bulkTemplates[field]
    if (!template) return
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      [field]: template.replace('{lessonNumber}', lesson.lessonNumber)
    })))
  }

  return (
    <div className="lesson-details-form">
      <h2>Lesson Details</h2>
      <p>Enter details for all {totalLessons} lessons</p>
      
      <div className="bulk-actions">
        <h3>Bulk Actions</h3>
        <div className="bulk-fill-section">
          <label>Prelearning Materials Template:</label>
          <textarea
            value={bulkTemplates.prelearning}
            onChange={(e) => handleBulkTemplateChange('prelearning', e.target.value)}
            placeholder="e.g., Watch video {lessonNumber} and read chapter {lessonNumber}"
            rows={2}
          />
          <button onClick={() => handleBulkFill('prelearningMaterials')}>
            Apply to All Lessons
          </button>
        </div>
        
        <div className="bulk-fill-section">
          <label>Guided Instructions Template:</label>
          <textarea
            value={bulkTemplates.guided}
            onChange={(e) => handleBulkTemplateChange('guided', e.target.value)}
            placeholder="e.g., Complete exercises {lessonNumber} and discuss in groups"
            rows={2}
          />
          <button onClick={() => handleBulkFill('guidedInstructions')}>
            Apply to All Lessons
          </button>
        </div>
        
        <div className="bulk-fill-section">
          <label>Hands-on Activities Template:</label>
          <textarea
            value={bulkTemplates.handsOn}
            onChange={(e) => handleBulkTemplateChange('handsOn', e.target.value)}
            placeholder="e.g., Lab exercise {lessonNumber}: Build a simple component"
            rows={2}
          />
          <button onClick={() => handleBulkFill('handsOnActivities')}>
            Apply to All Lessons
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="lessons-grid">
          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-card">
              <h4>Lesson {lesson.lessonNumber}</h4>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                  placeholder="Lesson title"
                />
              </div>

              <div className="form-group">
                <label>Prelearning Materials</label>
                <textarea
                  value={lesson.prelearningMaterials}
                  onChange={(e) => handleLessonChange(index, 'prelearningMaterials', e.target.value)}
                  placeholder="Add links to prelearning materials (one per line)"
                  rows={3}
                />
                <small>Add one link per line. Example: https://example.com/video1</small>
              </div>

              <div className="form-group">
                <label>Guided Instructions</label>
                <textarea
                  value={lesson.guidedInstructions}
                  onChange={(e) => handleLessonChange(index, 'guidedInstructions', e.target.value)}
                  placeholder="Add links to guided instructions (one per line)"
                  rows={3}
                />
                <small>Add one link per line. Example: https://example.com/instructions1</small>
              </div>

              <div className="form-group">
                <label>Hands-on Activities</label>
                <textarea
                  value={lesson.handsOnActivities}
                  onChange={(e) => handleLessonChange(index, 'handsOnActivities', e.target.value)}
                  placeholder="Add links to hands-on activities (one per line)"
                  rows={3}
                />
                <small>Add one link per line. Example: https://example.com/activity1</small>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Create Template with Lessons
          </button>
        </div>
      </form>
    </div>
  )
}

export default LessonDetailsForm
