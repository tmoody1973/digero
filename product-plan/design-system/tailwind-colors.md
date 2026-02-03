# Tailwind Color Configuration

## Color Choices

- **Primary:** `orange` — Used for buttons, links, key accents, active states
- **Secondary:** `green` — Used for success states, checkmarks, completed items
- **Neutral:** `stone` — Used for backgrounds, text, borders (warm gray)

## Usage Examples

### Primary (Orange)
```
Primary button: bg-orange-500 hover:bg-orange-600 text-white
Primary link: text-orange-600 hover:text-orange-700
Active tab: text-orange-600 border-orange-600
Primary badge: bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400
```

### Secondary (Green)
```
Success button: bg-green-500 hover:bg-green-600 text-white
Checkbox checked: bg-green-500 border-green-500
Completed state: text-green-600
Progress complete: bg-green-500
```

### Neutral (Stone)
```
Background: bg-stone-50 dark:bg-stone-950
Card: bg-white dark:bg-stone-800
Border: border-stone-200 dark:border-stone-700
Primary text: text-stone-900 dark:text-white
Secondary text: text-stone-500 dark:text-stone-400
Muted text: text-stone-400 dark:text-stone-500
```

## Dark Mode

All components support dark mode using Tailwind's `dark:` variant. The neutral palette (stone) shifts appropriately:

- `stone-50` → `stone-950` (backgrounds)
- `stone-200` → `stone-700` (borders)
- `stone-900` → `white` (text)
