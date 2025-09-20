# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Geniusglider IT Services** - Enterprise-grade landing page for IT services company targeting SMBs and mid-market clients globally. This is a conversion-optimized, performance-focused web application built with modern standards.

## Technical Architecture

- **Framework**: Vanilla HTML5/CSS3/ES6+ with progressive enhancement
- **Performance Targets**: Lighthouse 95+ across all metrics, Core Web Vitals optimized
- **Bundle Strategy**: Tree-shaking, code splitting, Brotli/Gzip compression
- **Caching**: Service worker implementation for offline functionality
- **Images**: WebP/AVIF with fallbacks, responsive images with srcset
- **Fonts**: font-display: swap with system font fallbacks

## Design System

**Color Palette (WCAG AAA compliant)**:
- Primary: `#0A1B35` (Navy) - 13.2:1 contrast ratio
- Secondary: `#1DB584` (Emerald) - accent and CTA
- Tertiary: `#F8FAFC` (Ghost) - backgrounds
- Text hierarchy: `#0F172A`, `#475569`, `#64748B`, `#94A3B8`

**Typography**: Modular scale (1.25 ratio), 16px base, geometric sans (Manrope/Inter alternative)
**Spacing**: 4px base unit, exponential scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128px)

## Key Features to Implement

1. **Progressive Multi-step Form** with validation, domain suggestions, and lead scoring
2. **ROI Calculators** for service value demonstration
3. **Interactive Case Studies** with filterable content
4. **Micro-interactions** using Intersection Observer API
5. **Exit-intent Modals** and retention strategies
6. **A/B Testing Framework** for continuous optimization

## Performance Requirements

- **LCP**: < 1.2s with resource prioritization
- **FID**: < 50ms with main thread optimization
- **CLS**: < 0.05 with size reservations
- **TTFB**: < 200ms with CDN and caching

## Integrations Required

- **Analytics**: Google Analytics 4 with enhanced e-commerce
- **CRM**: HubSpot/Pipedrive integration with custom fields
- **Calendar**: Calendly/Acuity booking integration
- **Marketing**: Drip email campaigns, SMS notifications
- **Security**: CSRF protection, bot detection, GDPR compliance

## Conversion Targets

- Form completion rate: >8%
- Qualified lead rate: >65%
- Session-to-opportunity: >25%
- Cost per qualified lead: <₹2,500

## Development Commands

*Note: Commands will be added as build system is implemented*

## Accessibility Standards

- WCAG 2.1 AAA compliance
- Screen reader optimization
- Keyboard navigation with visible focus
- High contrast mode support
- Voice navigation compatibility