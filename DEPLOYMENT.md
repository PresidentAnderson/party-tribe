# Party Tribe™ Deployment Guide

## 🌍 Live Site
**Production URL:** https://partytribe.vercel.app

## 🚀 Quick Deployment

### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed globally: `npm install -g vercel`
- Git repository initialized
- Vercel account connected

### Deployment Commands

```bash
# Production deployment
npm run deploy
# or
./scripts/deploy.sh

# Preview deployment (for testing)
npm run preview
# or
./scripts/preview.sh

# Local development server
npm run dev
# or
./scripts/dev.sh
```

## 📁 Project Structure

```
party-tribe/
├── index.html          # Main landing page
├── styles.css          # Complete styling with animations
├── script.js           # Interactive JavaScript features
├── vercel.json         # Vercel deployment configuration
├── package.json        # Project configuration
├── scripts/            # Deployment automation
│   ├── deploy.sh       # Production deployment script
│   ├── preview.sh      # Preview deployment script
│   └── dev.sh         # Local development server
└── DEPLOYMENT.md       # This file
```

## 🛠 Deployment Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "outputDirectory": "."
}
```

### Custom Domain
- **Primary:** https://partytribe.vercel.app
- **Deployment URLs:** Auto-generated Vercel URLs for each deployment

## 🔄 Deployment Workflow

1. **Local Development**
   ```bash
   npm run dev
   # Opens local server at http://localhost:8000
   ```

2. **Preview Testing**
   ```bash
   npm run preview
   # Creates a preview deployment for testing
   ```

3. **Production Deployment**
   ```bash
   npm run deploy
   # Deploys to production with custom domain
   ```

## 📊 Monitoring & Management

- **Vercel Dashboard:** https://vercel.com/axaiinovation/party-tribe
- **Deployment Logs:** Available in Vercel dashboard
- **Analytics:** Built-in Vercel analytics available

## 🔧 Environment Setup

### For New Contributors
1. Clone the repository
2. Install Vercel CLI: `npm install -g vercel`
3. Run `vercel login` to authenticate
4. Link to existing project: `vercel link`
5. Start development: `npm run dev`

### For Next.js Migration (Future)
The project is set up to easily migrate to Next.js:
- Package.json already configured
- Vercel configuration ready for frameworks
- Static assets properly organized

## 🎯 Features Deployed

✅ **Responsive Design** - Works on all devices  
✅ **Interactive Animations** - Smooth scrolling and hover effects  
✅ **Tribe Selection** - Five unique tribe categories  
✅ **FOMO Sections** - Dynamic countdown and engagement  
✅ **Mobile Optimized** - Touch-friendly navigation  
✅ **Fast Loading** - Optimized static assets  
✅ **SEO Ready** - Proper meta tags and structure  

## 🌐 CDN & Performance

- **Global CDN:** Vercel Edge Network
- **Regions:** Deployed to multiple regions for optimal performance
- **Caching:** Optimized caching headers for static assets
- **Compression:** Automatic Gzip/Brotli compression

## 🔒 Security Headers

Configured security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content Security Policy (via Vercel defaults)

## 📱 Mobile Features

- Touch-optimized interface
- Responsive breakpoints
- Mobile-first CSS approach
- Fast tap responses
- Optimized images for mobile

---

**Party Tribe™** - Where Fun Finds Its Tribe 🎉