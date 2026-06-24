# Circular Background Hover Expand (`ease-hover-bg-expand-circle`)

An elegant, high-performance circular ripple hover effect that grows from the center of an element to fill its background, styled with modern dark glassmorphism.

## Acceptance Criteria Met
- [x] **`::before` pseudo-element** with `border-radius: 50%` and transitions from `scale(0)` to `scale(3)` (or larger depending on card aspect ratio).
- [x] **`overflow: hidden`** enforced on the parent element to clip the expanding circle boundary.
- [x] **`--ease-circle-bg-color`** CSS variable implemented to easily change or customize the background grow color/gradient.

## Files
- `demo.html`: The HTML file showcasing the components.
- `style.css`: The CSS styling containing the animation transitions.

## How to use
Add the class `ease-circle-card` to any container, and customize its ripple color by setting the `--ease-circle-bg-color` variable:

```html
<div class="ease-circle-card" style="--ease-circle-bg-color: rgba(99, 102, 241, 0.25);">
  <div class="card-content">
    <h3>Card Title</h3>
    <p>Card Content</p>
  </div>
</div>
```
