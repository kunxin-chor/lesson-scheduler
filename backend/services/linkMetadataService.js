import axios from 'axios';
import * as cheerio from 'cheerio';

// Detect content type from URL and content
function detectContentType(url, contentType, $) {
  const urlLower = url.toLowerCase();
  
  // Check for PDF
  if (urlLower.endsWith('.pdf') || contentType?.includes('application/pdf')) {
    return 'pdf';
  }
  
  // Check for video platforms
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'video';
  }
  if (urlLower.includes('vimeo.com')) {
    return 'video';
  }
  if (urlLower.includes('dailymotion.com')) {
    return 'video';
  }
  
  // Check for video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  if (videoExtensions.some(ext => urlLower.endsWith(ext))) {
    return 'video';
  }
  
  // Check for image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  if (imageExtensions.some(ext => urlLower.endsWith(ext))) {
    return 'image';
  }
  
  // Check Open Graph type if available
  if ($) {
    const ogType = $('meta[property="og:type"]').attr('content');
    if (ogType) {
      if (ogType.includes('video')) return 'video';
      if (ogType.includes('article')) return 'article';
    }
    
    // Check for video tags
    if ($('video').length > 0) return 'video';
  }
  
  // Check for documentation sites
  const docSites = ['docs.', 'documentation.', 'developer.', 'api.', 'reference.'];
  if (docSites.some(site => urlLower.includes(site))) {
    return 'documentation';
  }
  
  // Default to web page
  return 'web';
}

// Extract title from HTML
function extractTitle($, url) {
  // Try Open Graph title first
  let title = $('meta[property="og:title"]').attr('content');
  if (title) return title.trim();
  
  // Try Twitter title
  title = $('meta[name="twitter:title"]').attr('content');
  if (title) return title.trim();
  
  // Try regular title tag
  title = $('title').text();
  if (title) return title.trim();
  
  // Try h1 tag
  title = $('h1').first().text();
  if (title) return title.trim();
  
  // Fallback to URL
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Get icon/emoji for content type
function getTypeIcon(type) {
  const icons = {
    'web': '🌐',
    'pdf': '📄',
    'video': '🎥',
    'article': '📰',
    'documentation': '📚',
    'image': '🖼️'
  };
  return icons[type] || '🔗';
}

export async function fetchLinkMetadata(url) {
  try {
    // Validate URL
    new URL(url);
    
    // Fetch the page with timeout
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: (status) => status < 400 // Accept redirects
    });
    
    const contentType = response.headers['content-type'];
    
    // If it's a PDF or binary file, return early
    if (contentType?.includes('application/pdf')) {
      const filename = url.split('/').pop() || 'Document';
      return {
        url,
        title: filename,
        type: 'pdf',
        icon: '📄'
      };
    }
    
    // Parse HTML
    const $ = cheerio.load(response.data);
    
    // Extract metadata
    const title = extractTitle($, url);
    const type = detectContentType(url, contentType, $);
    const icon = getTypeIcon(type);
    
    // Extract description (optional)
    let description = $('meta[property="og:description"]').attr('content') ||
                     $('meta[name="description"]').attr('content') ||
                     '';
    
    return {
      url,
      title,
      type,
      icon,
      description: description.trim()
    };
    
  } catch (error) {
    // If fetch fails, return basic info from URL
    console.error('Error fetching link metadata:', error.message);
    
    let title = url;
    try {
      const urlObj = new URL(url);
      title = urlObj.hostname + urlObj.pathname;
    } catch {
      // Keep original URL as title
    }
    
    // Try to detect type from URL alone
    const type = detectContentType(url, null, null);
    
    return {
      url,
      title,
      type,
      icon: getTypeIcon(type),
      description: '',
      error: 'Could not fetch page metadata'
    };
  }
}
