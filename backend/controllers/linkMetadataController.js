import * as linkMetadataService from '../services/linkMetadataService.js';

export async function getLinkMetadata(req, res) {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    const metadata = await linkMetadataService.fetchLinkMetadata(url);
    res.json(metadata);
  } catch (error) {
    console.error('Error in getLinkMetadata:', error);
    res.status(500).json({ error: 'Failed to fetch link metadata' });
  }
}
