# Geniusglider IT Services - Landing Page

Enterprise-grade, conversion-optimized landing page for Geniusglider IT Services. Built with modern web standards, advanced UX/UI, and performance optimization.

## Features

- **Performance**: Lighthouse 95+ score target, Core Web Vitals optimized
- **Accessibility**: WCAG 2.1 AAA compliant
- **Progressive Enhancement**: Works without JavaScript, enhanced with JS
- **Multi-step Form**: Smart validation, lead scoring, domain suggestions
- **ROI Calculators**: Interactive cost savings calculators
- **Responsive Design**: Mobile-first, progressive enhancement
- **Service Worker**: Offline functionality, caching strategies
- **Security**: CSP headers, XSS protection, HTTPS enforcement

## Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+
- **CSS Architecture**: Custom properties, modular scale, design system
- **JavaScript**: Progressive enhancement, intersection observers, form validation
- **Performance**: Critical CSS inlining, lazy loading, resource hints
- **PWA**: Service worker, web app manifest, offline support

## Quick Start

1. **Clone/Download** the repository
2. **Serve locally** using a web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```
3. **Open** `http://localhost:8000` in your browser

## File Structure

```
/
├── index.html              # Main landing page
├── manifest.json          # Web app manifest
├── sw.js                  # Service worker
├── .htaccess              # Apache configuration
├── assets/
│   ├── css/
│   │   ├── critical.css   # Above-the-fold CSS
│   │   └── styles.css     # Main stylesheet
│   ├── js/
│   │   └── app.js         # Main application
│   └── images/            # Images and icons
├── CLAUDE.md              # Claude Code guidance
└── README.md              # This file
```

## Configuration

### Google Analytics
Replace `GA_MEASUREMENT_ID` in `index.html` with your actual Google Analytics ID.

### Form Submission
Update the form submission endpoint in `assets/js/app.js`:
```javascript
const CONFIG = {
    apiEndpoints: {
        submitForm: '/your-api-endpoint',
        calculateROI: '/roi-endpoint'
    }
};
```

### Contact Information
Update contact details in `index.html` and structured data.

## Performance Optimization

- **Critical CSS**: Inlined in HTML head for faster render
- **Resource Hints**: Preload, prefetch, preconnect directives
- **Image Optimization**: WebP/AVIF with fallbacks
- **Compression**: Gzip/Brotli compression via .htaccess
- **Caching**: Long-term caching for static assets
- **Service Worker**: Advanced caching strategies

## Deployment

### Production Checklist

1. **Replace placeholder content** with real data
2. **Add real images** in WebP/AVIF formats
3. **Configure analytics** tracking
4. **Set up form endpoint** for submissions
5. **Enable HTTPS** and update security headers
6. **Test performance** with Lighthouse
7. **Validate accessibility** with screen readers

### Security

- Content Security Policy (CSP) headers
- X-Frame-Options, X-Content-Type-Options
- Strict Transport Security (HSTS)
- Input validation and sanitization

## Browser Support

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Progressive enhancement**: Basic functionality in older browsers
- **Mobile**: iOS Safari 11+, Chrome Mobile 60+

## Development

### Code Style
- Semantic HTML5
- BEM-inspired CSS naming
- Modern ES6+ JavaScript
- Mobile-first responsive design

### Testing
- HTML validation: [W3C Validator](https://validator.w3.org/)
- CSS validation: [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- Accessibility: [WAVE](https://wave.webaim.org/), [axe](https://www.deque.com/axe/)
- Performance: [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## License

Private - Geniusglider IT Services

## Support

For technical issues or customization requests, contact the development team.