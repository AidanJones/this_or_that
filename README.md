# This or That - Image Voting Tool

A simple, single-file web utility for creating image polls. Upload two images (or provide Amazon product URLs) and share with friends to help you choose between options.

## Features

- **Upload images** or **paste URLs** (Amazon products supported)
- Images are downsampled and compressed for easy sharing
- **Real-time vote counting** with Redis backend
- **Share polls** with a simple URL
- **One vote per browser** using localStorage
- **No build step** - just open index.html in a browser

## Usage

### Creating a Poll

1. Open `index.html` in your web browser
2. Choose your two options by either:
   - Uploading images using the "Upload Image" button
   - Pasting image URLs or Amazon product URLs
3. Click "Create Poll"
4. Share the generated URL with friends

### Voting

1. Click on your preferred image
2. Vote counts update in real-time for all viewers
3. You can only vote once per poll (tracked in browser localStorage)

## Technical Details

- **Single HTML file** with inline CSS and JavaScript
- **No dependencies** - pure vanilla JavaScript
- **Redis storage** via Upstash REST API for vote persistence
- **Image compression** - uploads are downsampled to 400px width and compressed as JPEG
- **Amazon URL support** - automatically detects and links to Amazon products

## Deployment

Simply host `index.html` on any static file server:
- GitHub Pages
- Netlify
- Vercel
- Or open directly in a browser

## How It Works

1. Images are compressed client-side using HTML Canvas
2. Poll data (images + URLs) stored in Redis with a UUID
3. Vote counts stored separately in Redis and incremented atomically
4. URL contains poll UUID: `index.html?poll=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
5. Page polls Redis every 2 seconds for vote updates

## Examples

**Fashion decision**: Upload two outfit photos and ask friends which looks better

**Menu choice**: Paste two Amazon product URLs to decide between items

**Design options**: Upload mockups and collect team votes 
