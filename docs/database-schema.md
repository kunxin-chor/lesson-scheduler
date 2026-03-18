# MongoDB Database Schema

## Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (required, hashed),
  name: String (required),
  role: String (enum: ['admin', 'instructor'], required),
  createdAt: Date (default: Date.now)
}
```

### LessonPlans
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  modules: [{
    id: String (required), // e.g., 'module-1234567890'
    name: String (required),
    order: Number (required), // For ordering modules
    referenceMaterials: String, // Markdown content for module reference materials
    lessons: [{
      id: String (required), // e.g., 'lesson-1234567890'
      title: String (required),
      prelearningMaterials: String, // Markdown content
      guidedInstructions: String,   // Markdown content
      handsOnActivities: String,    // Markdown content
      order: Number (required), // For ordering lessons within module
      createdAt: Date (default: Date.now),
      updatedAt: Date (default: Date.now)
    }]
  }],
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Intakes
```javascript
{
  _id: ObjectId,
  name: String (required),
  lessonPlanId: ObjectId (ref: 'LessonPlans'), // Optional for now
  startDate: Date (required),
  classSlotPatterns: [{
    dayOfWeek: Number (required), // 0=Sunday, 6=Saturday
    timeSlot: String (enum: ['morning', 'afternoon', 'evening'], required),
    frequency: Number (required) // 1=every week, 2=every 2 weeks, etc.
  }], // e.g., [{dayOfWeek: 1, timeSlot: 'morning', frequency: 1}, {dayOfWeek: 3, timeSlot: 'afternoon', frequency: 2}]
  exceptions: [String], // Array of ISO date strings (YYYY-MM-DD) to skip - includes public holidays
  classSlots: [{
    id: String (required),
    date: Date (required),
    dayOfWeek: Number (required),
    timeSlot: String (enum: ['morning', 'afternoon', 'evening'], required),
    isManuallyAdded: Boolean (default: false)
  }], // Generated class slots based on patterns and exceptions
  dayGapBetweenModules: Number (default: 0), // Number of days to skip between modules during slot generation
  status: String (enum: ['active', 'completed', 'archived'], default: 'active'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### ScheduledLessons
```javascript
{
  _id: ObjectId,
  intakeId: ObjectId (ref: 'Intakes', required),
  lessonPlanId: ObjectId (ref: 'LessonPlans', required),
  lessonId: String (required), // References lesson.id from LessonPlan
  moduleId: String (required), // References module.id from LessonPlan
  scheduledDate: Date (required),
  startTime: String (required), // "10:00" in HH:mm format
  endTime: String (required),   // "13:00" in HH:mm format
  status: String (enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled'),
  notes: String, // Instructor notes for this specific scheduled lesson
  createdAt: Date (default: Date.now)
}
```

### Calendars
```javascript
{
  _id: ObjectId,
  intakeId: ObjectId (ref: 'Intakes', required),
  events: [{
    date: Date (required),
    startTime: String (required), // "10:00" in HH:mm format
    endTime: String (required),   // "13:00" in HH:mm format
    scheduledLessonId: ObjectId (ref: 'ScheduledLessons')
  }],
  pdfPath: String, // Path to generated PDF (optional)
  generatedAt: Date,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## Schema Notes

### Lesson Plans Structure
- **Modules**: Array of module objects with unique IDs, each containing its own lessons array
- **Lessons**: Nested within modules, no separate moduleId needed
- **Markdown Support**: All material fields (`prelearningMaterials`, `guidedInstructions`, `handsOnActivities`) support markdown formatting including links, lists, bold, code blocks, etc.
- **Ordering**: Both modules and lessons have `order` fields for maintaining user-defined sequence
- **Timestamps**: Both lesson plans and individual lessons track `createdAt` and `updatedAt`
- **Hierarchy**: LessonPlan → Modules → Lessons (nested structure)

### Intakes and Class Slot Configuration
- **Intakes** reference a `LessonPlan` (optional) and define when/how classes are scheduled
- **classSlotPatterns**: Array defining recurring class schedule with frequency support
  - Each pattern specifies: `dayOfWeek` (0-6), `timeSlot` (morning/afternoon/evening), and `frequency`
  - `frequency: 1` = every week, `frequency: 2` = every 2 weeks, etc.
  - Example: `[{dayOfWeek: 1, timeSlot: 'morning', frequency: 1}, {dayOfWeek: 3, timeSlot: 'afternoon', frequency: 2}]`
  - Allows flexible scheduling with alternating week patterns
- **exceptions**: Array of ISO date strings (YYYY-MM-DD) to skip
  - Used for public holidays and other skip dates
  - Admin manually enters these dates when creating/updating intake
- **dayGapBetweenModules**: Number of days to skip between modules during slot generation
  - Used only during slot generation, not stored in modules themselves
  - Allows automatic spacing between modules (e.g., 7 days for a week break)
  - Default is 0 (no gap between modules)
- **classSlots**: Generated array of actual class slots
  - Automatically generated based on `startDate`, `classSlotPatterns`, `exceptions`, and `dayGapBetweenModules`
  - Each slot has: `id`, `date`, `dayOfWeek`, `timeSlot`, and `isManuallyAdded` flag
  - Admin can manually add/delete individual slots after generation

### Scheduled Lessons
- **ScheduledLessons** are created when an intake is assigned a lesson plan
- Store **actual times** (`startTime`, `endTime`) copied from intake's timeSlotConfig at creation time
- This preserves historical accuracy - changing intake's time config doesn't affect already scheduled lessons
- Each scheduled lesson references both the lesson and module from the lesson plan

### Calendars
- **Calendars** aggregate all scheduled lessons for an intake
- Events store actual start/end times and reference the scheduled lesson
- Used for generating PDF calendars and displaying the full schedule

### User Roles
- **admin**: Full system access
- **instructor**: Manage lesson plans, intakes, and calendars
- No student role - students don't access the system

### Data Flow
1. Create **LessonPlan** with modules and lessons
2. Create **Intake**:
   - Select a lesson plan
   - Define start date and lesson days with time slots
   - Configure time ranges for morning/afternoon/evening
   - Set exceptions (skip/add dates)
3. System generates **ScheduledLessons**:
   - Maps each lesson to specific dates based on lessonDays and exceptions
   - Copies actual start/end times from intake's timeSlotConfig
4. **Calendar** aggregates all scheduled lessons with their times for display and PDF generation
