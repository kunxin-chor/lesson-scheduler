# MongoDB Database Schema

## Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (required, hashed),
  name: String (required),
  role: String (enum: ['admin', 'instructor', 'student'], required),
  createdAt: Date (default: Date.now)
}
```

### Intakes
```javascript
{
  _id: ObjectId,
  name: String (required),
  startDate: Date (required),
  lessonDays: [String], // ['Monday', 'Wednesday', 'Friday']
  exceptions: [Date], // No class dates
  holidays: [Date], // Public holidays
  createdAt: Date (default: Date.now)
}
```

### Courses
```javascript
{
  _id: ObjectId,
  title: String (required),
  intakeId: ObjectId (ref: 'Intakes', required),
  templateId: ObjectId (ref: 'Templates'),
  createdAt: Date (default: Date.now)
}
```

### Lessons
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref: 'Courses', required),
  lessonNumber: Number (required),
  title: String (required),
  scheduledDate: Date,
  prelearningMaterials: String, // Textarea with links
  guidedInstructions: String,   // Textarea with links  
  handsOnActivities: String,    // Textarea with links
  createdAt: Date (default: Date.now)
}
```

### Templates
```javascript
{
  _id: ObjectId,
  name: String (required),
  lessonDays: [String],
  totalLessons: Number,
  createdAt: Date (default: Date.now)
}
```

### Calendars
```javascript
{
  _id: ObjectId,
  intakeId: ObjectId (ref: 'Intakes', required),
  events: [{
    date: Date,
    type: String, // 'lesson', 'holiday', 'break'
    lessonId: ObjectId (ref: 'Lessons'), // Only for lesson events
    title: String
  }],
  pdfPath: String, // Path to generated PDF (optional)
  generatedAt: Date (default: Date.now)
}
```

That's it. Simple and focused on your actual needs.
