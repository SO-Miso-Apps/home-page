# Neubrutalism Gumroad-Style UI Components

A bold, playful, and modern UI component library inspired by Neubrutalism design principles and Gumroad's distinctive aesthetic.

## 🎨 Design Philosophy

This component library embraces the **Neubrutalism** design movement, characterized by:

### Visual Characteristics

- **Blocky & Geometric**: Distinct, prominent rectangular and square shapes
- **Bold Outlines**: 4px thick black borders on all elements
- **Vibrant Colors**: High-saturation primary colors (blue, red, yellow, green, purple)
- **Strong Shadows**: 6-8px offset shadows creating a faux-3D effect
- **High Contrast**: Sharp color contrasts against clean white/light backgrounds
- **Minimalist Layout**: Clear hierarchy with generous whitespace

### Mood & Feel

- **User-Friendly**: Inviting and easy to interact with
- **Creative & Informal**: Hand-drawn, "maker" aesthetic
- **Energetic & Playful**: Bold and attention-grabbing
- **Raw & Honest**: Unpolished brutalist roots with modern polish

## 📦 Components

### NeubrutalistButton

Bold, tactile buttons with thick borders and satisfying interactions.

**Props:**
- `children`: React.ReactNode - Button content
- `onClick?`: () => void - Click handler
- `href?`: string - Link destination
- `variant?`: 'primary' | 'secondary' | 'accent' | 'warning' - Color scheme
- `size?`: 'small' | 'medium' | 'large' - Button size

**Example:**
```tsx
import { NeubrutalistButton } from '@site/src/components/Neubrutalism';

<NeubrutalistButton variant="primary" size="large" href="/docs">
  Get Started 🚀
</NeubrutalistButton>
```

**Variants:**
- **Primary**: Electric blue (#3B82F6) - Main actions
- **Secondary**: Sunny yellow (#FBBF24) - Secondary actions
- **Accent**: Vibrant red (#EF4444) - Important actions
- **Warning**: Hot pink (#EC4899) - Destructive actions

### NeubrutalistCard

Geometric content cards with bold icons and color-coded accents.

**Props:**
- `title`: string - Card heading
- `description`: string - Card content
- `icon?`: string - Emoji or icon
- `color?`: 'blue' | 'red' | 'yellow' | 'green' | 'purple' - Color accent
- `href?`: string - Link destination

**Example:**
```tsx
import { NeubrutalistCard } from '@site/src/components/Neubrutalism';

<NeubrutalistCard
  icon="🚀"
  color="blue"
  title="Quick Start"
  description="Get up and running in minutes."
  href="/docs/quick-start"
/>
```

**Features:**
- Hover animation with shadow expansion
- Color-coded top accent bar
- Bold icon container with matching colors
- Responsive grid-friendly design

### NeubrutalistHero

Eye-catching hero section with animated geometric shapes.

**Props:**
- `title`: string - Main headline
- `subtitle`: string - Supporting text
- `primaryCTA?`: { text: string, href: string } - Primary call-to-action
- `secondaryCTA?`: { text: string, href: string } - Secondary call-to-action

**Example:**
```tsx
import { NeubrutalistHero } from '@site/src/components/Neubrutalism';

<NeubrutalistHero
  title="Bold & Playful Design"
  subtitle="Experience the raw energy of Neubrutalism."
  primaryCTA={{ text: "Get Started", href: "/docs" }}
  secondaryCTA={{ text: "View Demo", href: "/demo" }}
/>
```

**Features:**
- Animated floating geometric shapes
- Dramatic text shadows
- Responsive typography
- Integrated CTA buttons

## 🎨 Color Palette

```css
--neu-white: #FFFFFF;
--neu-black: #000000;
--neu-blue: #3B82F6;
--neu-red: #EF4444;
--neu-yellow: #FBBF24;
--neu-green: #10B981;
--neu-purple: #8B5CF6;
--neu-pink: #EC4899;
```

## 📐 Design Tokens

```css
--neu-border-width: 4px;
--neu-shadow-offset: 6px;
--neu-border-radius: 12px;
```

## 🚀 Usage

### Import Components

```tsx
import { 
  NeubrutalistButton, 
  NeubrutalistCard, 
  NeubrutalistHero 
} from '@site/src/components/Neubrutalism';
```

### Basic Page Layout

```tsx
export default function MyPage() {
  return (
    <Layout>
      <NeubrutalistHero
        title="Welcome"
        subtitle="Start building something amazing"
        primaryCTA={{ text: "Start Now", href: "/start" }}
      />
      
      <main>
        <div className="container">
          <NeubrutalistCard
            icon="✨"
            color="blue"
            title="Feature"
            description="Amazing feature description"
          />
        </div>
      </main>
    </Layout>
  );
}
```

## 📱 Responsive Design

All components are fully responsive with mobile-first design:

- **Desktop**: Full animations, larger shadows, prominent typography
- **Tablet** (≤768px): Adjusted spacing, smaller shadows
- **Mobile** (≤480px): Stacked layouts, simplified animations

## ♿ Accessibility

- High contrast ratios for readability
- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements

## 🎯 Best Practices

1. **Use Sparingly**: Bold designs work best as accents
2. **Maintain Hierarchy**: Use size and color to guide attention
3. **Embrace Whitespace**: Let bold elements breathe
4. **Mix Variants**: Combine different colors for visual interest
5. **Keep It Simple**: Don't overcrowd with too many elements

## 🌐 Demo

Visit `/neubrutalism-demo` to see all components in action with interactive examples.

## 📄 License

Part of the Miso Apps documentation site.

---

**Built with bold strokes and vibrant colors** 🎨✨
