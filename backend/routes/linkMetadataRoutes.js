import express from 'express';
import * as linkMetadataController from '../controllers/linkMetadataController.js';

const router = express.Router();

router.get('/', linkMetadataController.getLinkMetadata);

export default router;
