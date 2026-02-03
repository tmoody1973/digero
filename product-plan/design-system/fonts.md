# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;1,6..12,400&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** Nunito Sans (font-weight: 600-700)
- **Body text:** Nunito Sans (font-weight: 400-500)
- **Code/technical:** IBM Plex Mono (font-weight: 400-500)

## Tailwind Configuration

If using Tailwind, extend your config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
}
```

## Font Weights

- **Regular (400):** Body text, descriptions
- **Medium (500):** Labels, emphasized text
- **Semibold (600):** Subheadings, buttons
- **Bold (700):** Main headings, titles
