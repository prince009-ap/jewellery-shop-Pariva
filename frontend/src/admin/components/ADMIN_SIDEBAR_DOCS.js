/**
 * ADMIN SIDEBAR NAVIGATION SYSTEM
 * 
 * A professional, modern, responsive sidebar navigation for admin dashboards
 * similar to Shopify, Stripe, and Vercel control panels.
 * 
 * ============================================
 * FEATURES
 * ============================================
 * 
 * ✓ Professional Modern Design
 *   - Clean, minimalist sidebar with soft background
 *   - Rounded elements with smooth transitions
 *   - Professional color scheme and typography
 * 
 * ✓ Responsive Layout
 *   - Desktop (1024px+): Fixed sidebar always visible
 *   - Tablet (768px-1023px): Collapsible sidebar with icons-only mode
 *   - Mobile (< 768px): Hamburger menu with sliding drawer
 * 
 * ✓ Interactive Elements
 *   - Smooth hover animations
 *   - Active menu highlighting with indicator
 *   - Icon + text alignment
 *   - Animated collapse/expand transitions
 * 
 * ✓ User-Friendly Components
 *   - Smooth slide-in animations
 *   - Scrollable sidebar if menu grows
 *   - Logout button in footer
 *   - Mobile backdrop overlay
 * 
 * ============================================
 * COMPONENT HIERARCHY
 * ============================================
 * 
 * AdminLayout (Wrapper component)
 *   └── AdminSidebar (Navigation component)
 *       ├── Menu items
 *       ├── Logout button
 *       └── Collapse/Expand controls
 *   └── admin-main-content (Page content)
 *       └── Actual admin page (Dashboard, Products, Orders, etc.)
 * 
 * ============================================
 * SCREENS & BREAKPOINTS
 * ============================================
 * 
 * Desktop (1024px+):
 * ┌─────────────┬──────────────────────┐
 * │             │                      │
 * │  Sidebar    │  Main Content        │
 * │  260px      │  Flexible            │
 * │             │                      │
 * │ [Home]      │  Dashboard Content   │
 * │ [Banners]   │                      │
 * │ [Products]  │                      │
 * │ [Orders]    │                      │
 * │ [Users]     │                      │
 * │ [Feedback]  │                      │
 * │ [Custom]    │                      │
 * │ [Coupons]   │                      │
 * │ [Logout]    │                      │
 * │             │                      │
 * └─────────────┴──────────────────────┘
 * 
 * Tablet (768px - 1023px):
 * ┌──┬─────────────────────────────────┐
 * │  │                                 │
 * │[☰]│        Main Content             │
 * │  │                                 │
 * │━━│─────────────────────────────────│
 * │  │  Dashboard Content              │
 * │
 * When collapsed: Icons only (80px)
 * When expanded: Full sidebar (240px)
 * 
 * Mobile (< 768px):
 * [☰]  Main Content
 *      Dashboard Content
 * 
 * When hamburger clicked:
 * ┌─────────────┐
 * │  Sidebar    │ Slides in from left
 * │  (280px)    │ with backdrop
 * │             │
 * │ [Home]      │
 * │ [Banners]   │
 * │ [Products]  │
 * │ [Orders]    │
 * │ [Users]     │
 * │ [Feedback]  │
 * │ [Custom]    │
 * │ [Coupons]   │
 * │ [Logout]    │
 * │             │
 * └─────────────┘
 * 
 * ============================================
 * USAGE IN ROUTES
 * ============================================
 * 
 * All admin pages are wrapped with AdminLayout:
 * 
 * <Route
 *   path="/admin/dashboard"
 *   element={
 *     <AdminRoute>
 *       <AdminLayout>
 *         <AdminDashboard />
 *       </AdminLayout>
 *     </AdminRoute>
 *   }
 * />
 * 
 * This ensures the sidebar persists across all admin pages.
 * 
 * ============================================
 * STYLING VARIABLES
 * ============================================
 * 
 * --sidebar-width: 260px (Desktop)
 * --sidebar-width-collapsed: 80px (Tablet collapsed mode)
 * --sidebar-bg: #ffffff
 * --sidebar-border: #e5e7eb
 * --menu-text: #374151
 * --menu-text-hover: #111827
 * --menu-bg-hover: #f3f4f6
 * --menu-active-bg: #f0fdf4
 * --menu-active-text: #059669
 * --menu-active-indicator: #10b981
 * --transition-speed: 0.3s
 * 
 * ============================================
 * RESPONSIVE BEHAVIOR
 * ============================================
 * 
 * Desktop (1024px+):
 * - Sidebar always visible and expandable
 * - Collapse button on right side
 * - Main content adjusts margin based on sidebar state
 * 
 * Tablet (768px-1023px):
 * - Only icons visible by default (80px width)
 * - Sidebar collapses automatically
 * - No main collapse button (space constrained)
 * 
 * Mobile (< 768px):
 * - Hamburger menu (40-44px button)
 * - Sliding drawer sidebar (280px or full width)
 * - Backdrop overlay when open
 * - Auto-closes on route change
 * 
 * ============================================
 * KEYBOARD & ACCESSIBILITY
 * ============================================
 * 
 * - All buttons are keyboard navigable
 * - Links use proper <Link> for routing
 * - Icons have implicit labels from text
 * - Proper z-index layering for modal effects
 * - Focus states for keyboard navigation
 * 
 * ============================================
 * COLOR SCHEME (Green Accent)
 * ============================================
 * 
 * Active State: #f0fdf4 (very light green background)
 * Active Text: #059669 (green text)
 * Active Indicator: #10b981 (brighter green accent bar)
 * 
 * Logout Button: Pink/Red gradient
 * Background: #fee8f0 → #fce7ea
 * Hover: #fbd5e8 → #f9c7dd
 * Text: #be185d
 * 
 * ============================================
 * ANIMATION TIMINGS
 * ============================================
 * 
 * Menu item hover: translateX(2px) with color change
 * Sidebar collapse: 0.3s ease transition
 * Mobile slide-in: 0.3s ease from -100% to 0
 * Icon scale: 1 → 1.1 on hover
 * 
 * ============================================
 * FILES STRUCTURE
 * ============================================
 * 
 * frontend/src/admin/components/
 * ├── AdminSidebar.jsx         ← Navigation component with icons
 * ├── AdminSidebar.css         ← Sidebar styles (responsive, animations)
 * ├── AdminLayout.jsx          ← Main layout wrapper
 * └── AdminLayout.css          ← Layout styles
 * 
 * frontend/src/routes/
 * └── index.jsx                ← All admin routes wrapped with AdminLayout
 * 
 * ============================================
 * ICONS USED (react-icons/md)
 * ============================================
 *
 * – MdFeedback   ← Customer feedback / reviews
 * 
 * Dashboard: MdHome
 * Home Banners: MdImage
 * Manage Products: MdShoppingCart
 * View Orders: MdPalette
 * View Users: MdPeople
 * Custom Designs: MdPalette
 * Manage Coupons: MdLocalOffer
 * Hamburger Menu: MdMenu
 * Close: MdClose
 * Logout: MdLogout
 * 
 * ============================================
 * CSS CLASSES
 * ============================================
 * 
 * .admin-layout                ← Flex container
 * .admin-sidebar               ← Main sidebar container
 * .admin-sidebar.collapsed     ← Collapsed state
 * .admin-sidebar.mobile-open   ← Mobile drawer open
 * .admin-sidebar-header        ← Logo/brand area
 * .admin-sidebar-menu          ← Menu items container
 * .admin-menu-item             ← Individual menu items
 * .admin-menu-item.active      ← Active/current page highlight
 * .admin-menu-icon             ← Icon container
 * .admin-menu-label            ← Text label
 * .admin-menu-indicator        ← Right-side active indicator bar
 * .admin-sidebar-footer        ← Logout button area
 * .admin-logout-btn            ← Logout button
 * .admin-sidebar-toggle        ← Mobile hamburger button
 * .admin-sidebar-backdrop      ← Mobile overlay backdrop
 * .admin-sidebar-collapse-btn  ← Desktop collapse button
 * .admin-main-content          ← Main content area
 * 
 * ============================================
 * BROWSER COMPATIBILITY
 * ============================================
 * 
 * ✓ Chrome/Chromium (Latest)
 * ✓ Firefox (Latest)
 * ✓ Safari (Latest)
 * ✓ Edge (Latest)
 * ✓ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)
 * 
 * Uses:
 * - CSS Grid & Flexbox (all modern browsers)
 * - CSS Custom Properties (variables)
 * - CSS Transitions (hardware accelerated)
 * - React Router v7+ Link components
 * - React 19.2.0+ hooks
 * 
 * ============================================
 * PERFORMANCE OPTIMIZATIONS
 * ============================================
 * 
 * ✓ Hardware-accelerated animations (translate, transform)
 * ✓ Minimal re-renders using hooks
 * ✓ Event delegation for menu items
 * ✓ CSS-based animations (no JavaScript animations)
 * ✓ Responsive design prevents scrollbars
 * ✓ Efficient z-index layering
 * 
 * ============================================
 * CUSTOMIZATION GUIDE
 * ============================================
 * 
 * 1. Change Sidebar Width:
 *    Update --sidebar-width in AdminSidebar.css
 * 
 * 2. Change Colors:
 *    Update CSS variables at top of AdminSidebar.css
 * 
 * 3. Add Menu Items:
 *    Add to menuItems array in AdminSidebar.jsx
 * 
 * 4. Change Icons:
 *    Import different icons from react-icons
 * 
 * 5. Adjust Transitions:
 *    Update --transition-speed variable
 * 
 * 6. Customize Active State:
 *    Modify isActive() function logic
 * 
 * ============================================
 * KNOWN LIMITATIONS & CONSIDERATIONS
 * ============================================
 * 
 * - Sidebar is fixed position (doesn't scroll with page content on desktop)
 * - Mobile display doesn't show labels initially (icons-only on collapsed)
 * - Logout button redirects to /admin/login (hardcoded)
 * - No nested menu support (could be added)
 * - Menu items are hardcoded (could be made dynamic from props)
 * 
 * ============================================
 * FUTURE ENHANCEMENTS
 * ============================================
 * 
 * - Nested/sub-menu support
 * - Dynamic menu from config/prop
 * - Keyboard shortcuts for menu navigation
 * - Searchable menu items
 * - Collapsible menu sections
 * - Dark mode support
 * - Customizable theme colors
 * - Menu item badges/notifications
 * - User profile section in footer
 * 
 * ============================================
 */

export const AdminSidebarDocumentation = {
  components: ["AdminSidebar.jsx", "AdminLayout.jsx"],
  styles: ["AdminSidebar.css", "AdminLayout.css"],
  responsive: {
    desktop: "1024px+",
    tablet: "768px - 1023px",
    mobile: "< 768px",
  },
  features: [
    "Professional modern design",
    "Responsive sidebar (fixed/collapsible/drawer)",
    "Active menu highlighting",
    "Smooth animations",
    "Mobile hamburger menu",
    "Persistent across all admin pages",
  ],
};
