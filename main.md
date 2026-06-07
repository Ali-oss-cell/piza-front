### Task: Migrate Static HTML/CSS/JS Blueprint to Next.js (App Router) + TypeScript

Convert the stitched static prototype located in the `./static-source/` folder into a modular, type-safe Next.js frontend application using TypeScript and an open-source UI component system (Tailwind CSS + shadcn/ui ecosystem).

#### 1. Architecture & Setup
* **Framework:** Next.js (latest App Router structure).
* **Language:** Strict TypeScript. Define robust interfaces/types for all component props and data structures.
* **UI System:** Use Tailwind CSS for utility styling and `shadcn/ui` (Radix primitives) for accessible, smooth interactive components (modals, dropdowns, sheets, etc.).

#### 2. Analysis & Extraction Phase
* Analyze the HTML structure, CSS layouts, and vanilla JavaScript behaviors in `./static-source/`.
* Break down the monolithic HTML files into a logical atomic component hierarchy:
    * `layout.tsx` for persistent shell elements (Sidebar, Navbar, Footer).
    * `page.tsx` for specific view configurations.
    * `/components/ui/` for small, reusable atomic elements (buttons, inputs, cards).
    * `/components/features/` for complex page-specific sections.

#### 3. Styling & Custom Theme Migration
* Extract global styles, custom color palettes, and unique visual effects (e.g., smooth transitions, specific gradients, overlay effects) from the source CSS.
* Map these custom styles into the `tailwind.config.js` file as extended theme variables, ensuring they play nicely with dark/light design tokens.
* Convert inline or block styles from the source HTML into clean, utility-first Tailwind classes where appropriate.

#### 4. TypeScript & Component Conversion
* Convert vanilla JS interactions (click events, tab switching, state toggles) into idiomatic React state hook patterns (`useState`, `useEffect`, `useReducer`).
* Ensure every interactive component has explicit TypeScript prop definitions. Avoid using `any`.
* Optimize asset paths: Move image and font assets from the static folder to the Next.js `/public` directory, and replace standard `<img>` tags with the optimized Next.js `<Image />` component.

#### 5. Output Deliverables
* Generate the necessary Next.js route folders and page components.
* Provide clear component code blocks that are modular, readable, and free of dead or redundant legacy code.
* If any additional dependencies need installation (e.g., lucide-react for icons, clsx/tailwind-merge for dynamic classes), list them clearly at the top.