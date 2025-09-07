# Prairie Giraffe Brand Guidelines

## Colors

### Primary Colors
- **Accent Blue**: `rgb(37, 99, 235)` / `#2563eb`
  - Used for: Buttons, links, highlights, call-to-action elements
  - Professional blue that conveys trust and technology
- **Dark Text**: `rgba(0, 0, 0, 1)` / `#000000`
- **Light Background**: `rgba(255, 255, 255, 1)` / `#ffffff`

### Text Colors
- **Primary Text**: `rgba(0, 0, 0, 0.8)` - Main content
- **Secondary Text**: `rgba(0, 0, 0, 0.5)` - Descriptions, body text
- **Muted Text**: `rgba(0, 0, 0, 0.3)` - Subtle text elements

## Typography
- **Font Family**: 'Outfit', sans-serif
- **Headings**: Various weights (100-900 available)
- **Body Text**: 16px base, 300 weight
- **Line Height**: 150%

## Logo
- **Text Logo**: "PG." - Clean, minimal representation
- **Full Name**: "Prairie Giraffe" - Used in footers and formal contexts

## Brand Colors Usage

### Where Blue Appears:
- Navigation active states
- Button backgrounds and borders
- Link hover states
- Form field focus states
- Icon highlights
- Category labels/badges
- Progress indicators

### Brand Personality
- **Professional** - Clean, modern design
- **Trustworthy** - Blue conveys reliability in tech
- **Local** - Wyoming/Gillette focused
- **Approachable** - Not overly corporate

## CSS Variable
The accent color is defined in `ashley/scss/_variables.scss`:
```scss
$accent: rgba(37, 99, 235, 1);
```

To change the accent color site-wide, update this variable and run:
```bash
npm run build:css
```