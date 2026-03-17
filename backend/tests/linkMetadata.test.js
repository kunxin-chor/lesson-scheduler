import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testHelpers.js';

const app = createTestApp();

describe('Link Metadata API', () => {
  it('should fetch metadata for a valid URL', async () => {
    const testUrl = 'https://developer.mozilla.org';
    
    const response = await request(app)
      .get('/api/link-metadata')
      .query({ url: testUrl })
      .expect(200);

    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('icon');
    expect(response.body.url).toBe(testUrl);
  });

  it('should detect PDF type from URL', async () => {
    const pdfUrl = 'https://example.com/document.pdf';
    
    const response = await request(app)
      .get('/api/link-metadata')
      .query({ url: pdfUrl })
      .expect(200);

    expect(response.body.type).toBe('pdf');
    expect(response.body.icon).toBe('📄');
  });

  it('should detect YouTube video type', async () => {
    const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    const response = await request(app)
      .get('/api/link-metadata')
      .query({ url: youtubeUrl })
      .expect(200);

    expect(response.body.type).toBe('video');
    expect(response.body.icon).toBe('🎥');
  });

  it('should return 400 when URL is missing', async () => {
    await request(app)
      .get('/api/link-metadata')
      .expect(400);
  });

  it('should handle invalid URLs gracefully', async () => {
    const invalidUrl = 'not-a-valid-url';
    
    const response = await request(app)
      .get('/api/link-metadata')
      .query({ url: invalidUrl })
      .expect(200);

    // Service returns metadata with error field for invalid URLs
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('error');
  });

  it('should detect documentation sites', async () => {
    const docUrl = 'https://docs.example.com/api/reference';
    
    const response = await request(app)
      .get('/api/link-metadata')
      .query({ url: docUrl })
      .expect(200);

    expect(response.body.type).toBe('documentation');
    expect(response.body.icon).toBe('📚');
  });
});
