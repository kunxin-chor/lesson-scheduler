import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import intakeRoutes from './routes/intakeRoutes.js';
import lessonPlanRoutes from './routes/lessonPlanRoutes.js';
import linkMetadataRoutes from './routes/linkMetadataRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Running in ${NODE_ENV} mode`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/intakes', intakeRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/link-metadata', linkMetadataRoutes);
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
