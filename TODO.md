พร็อพก่อนหน้า "แก้ไขระบบทั้งหมดขึ้นอยู่ login หมายถึง รายการโปรดการเพิ่มตระกร้าทั้งหมด รีวิว ข้อมูลแยกกันตามที่ล็อคอินและช่วยเพิ่มรูปภาพสินค้าทั้งหมดให้หน่อย

  เปลี่ยนระบบ Forget password เป็นใส่เบอร์โทร และเพิ่มระบบสำหรับผู้ใช้แก้ไขข้อมูลส่วนตัวได้ เพิ่ม Feat ที่คุณคิดว่าดีเข้าไปทำให้ e-com นี้ต๋งขึ้น

  เพิ่มการสมัครมาเป็น ร้าน partner ลงสินค้าได้มี Dashboard ละเอียดสำหรับร้านและตัวระบบ founder Project นี้ผมตะส่งแข่งขันโดยต้องมีดังนี้ 1.

  Dashboard / Overview

  แสดง KPI สำคัญ, กราฟ, หรือการ์ดสรุปผล

  2. List + Filter/Search

  แสดงข้อมูลแบบตาราง/การ์ด พร้อมระบบค้นหาและกรอง

  3. Detail Page

  ดูรายละเอียดเชิงลึกของแต่ละ Record

  4. Performance

  Responsive รองรับทุกจอ และ Lighthouse Score ≥ 90"



ผลรับที่ได้

E-Commerce Enhancement Plan



     MSU SHOP AI - Hackathon 2026



     Context



     This project is a hackathon submission requiring comprehensive e-commerce features including user-specific data management, partner store system, phone-based authentication, and performance optimization.



     Current State Analysis:

     - Auth: Email/password with localStorage persistence

     - Data Storage: JSON files (users.json, products.json, ecommerce_orders.json)

     - Cart/Wishlist/Compare: localStorage-based (not user-specific)

     - Reviews: Embedded in products.json

     - Products: Placeholder images from placehold.co

     - Roles: customer/founder (derived from MEMBER/VIP)

     - Dashboard: Founder-only with basic KPIs and product management

     - No partner/store system, no profile editing, no phone auth



     Required Features for Hackathon:

     1. Dashboard/Overview - KPIs, graphs, summary cards

     2. List + Filter/Search - Table/card views with search and filtering

     3. Detail Page - Deep record details

     4. Performance - Responsive design, Lighthouse Score ≥ 90



     ---

     Implementation Plan



     Phase 1: User-Specific Data Architecture



     Changes needed:



     1. Update data structure for user-specific storage:

       - Create lib/user-data.json to store per-user data:

     {

       "u001": {

         "cart": [...],

         "wishlist": [...],

         "reviews": [...],

         "recentlyViewed": [...]

       }

     }

       - Or extend users.json with these fields

     2. Update hooks to load data based on logged-in user:

       - hooks/use-cart.tsx: Load from user-data.json instead of localStorage

       - hooks/use-wishlist.tsx: Same approach

       - hooks/use-recently-viewed.tsx: Same approach

     3. API endpoints for user data:

       - GET /api/user-data/:userId - Fetch user's cart, wishlist

       - PUT /api/user-data/:userId - Update user data

       - POST /api/reviews - Submit review (links to user)



     ---

     Phase 2: Phone-Based Password Reset



     Changes needed:



     1. Update forget password flow in app/login/page.tsx:

       - Change input from email to phone number

       - Add OTP input field

       - New password input fields

     2. Create API endpoint app/api/auth/reset-password/route.ts:

       - Validate phone number exists in users.json

       - Generate/send OTP (demo: show in console or mock)

       - Verify OTP and update password

     3. Update translations (lib/translations.ts):

       - Add phone number fields

       - Add OTP-related strings



     ---

     Phase 3: User Profile Management



     New pages/components:



     1. Create profile page app/profile/page.tsx:

       - Display user info (name, email, phone, loyalty points)

       - Edit form for name, email, phone

       - Password change form

     2. Create API endpoint app/api/users/update/route.ts:

       - Update user data in users.json

       - Validate email uniqueness

     3. Add translations for profile page



     ---

     Phase 4: Partner/Store System



     New data structure:



     1. Create lib/stores.json:

     {

       "store_id": "s-001",

       "name": "Store Name",

       "owner_id": "u001",

       "description": "...",

       "status": "active|pending|suspended",

       "rating": 4.5,

       "products": ["p-101", "p-102"],

       "joined_at": "2026-01-01"

     }

     2. Update types/index.ts:

       - Add Store interface

       - Add StoreApplication interface

     3. New pages:

       - app/partner/register/page.tsx - Partner registration form

       - app/partner/dashboard/page.tsx - Store dashboard

       - app/store/[id]/page.tsx - Public store page

     4. API endpoints:

       - app/api/partners/register/route.ts

       - app/api/stores/route.ts

       - app/api/stores/[id]/products/route.ts



     ---

     Phase 5: Enhanced Dashboards



     Founder Dashboard (app/dashboard/founder/page.tsx):

     - Platform-wide KPIs (revenue, users, products, orders)

     - Revenue chart (mock data)

     - Top stores ranking

     - Recent orders table

     - Pending partner applications



     Seller/Partner Dashboard (app/dashboard/partner/page.tsx):

     - Store-specific KPIs

     - Product management (CRUD)

     - Order management (store's orders only)

     - Sales chart

     - Inventory alerts



     ---

     Phase 6: Product Images



     Approach options:

     - Option A: Use Unsplash source URLs

     - Option B: Upload to public folder

     - Option C: Use Cloudinary/Supabase Storage



     Implementation:

     - Update all products in lib/products.json with real image URLs

     - Categories need appropriate images:

       - Electronics: gadgets, devices

       - Fashion: clothing, accessories

       - Home: furniture, decor

       - Sports: equipment

       - Beauty: cosmetics

       - Toys: games, figures



     ---

     Phase 7: Enhanced Filter/Search



     Current: Basic search exists



     Enhancements needed:

     1. Advanced filters page component:

       - Price range slider

       - Category multi-select

       - Rating filter

       - Store filter

       - In-stock only toggle

     2. Sort options:

       - Price (low/high)

       - Rating

       - Newest

       - Best selling



     ---

     Phase 8: Detail Pages Enhancement



     Product detail page improvements:

     - Store information section

     - Related products from same store

     - Review submission form (for logged-in users)

     - Question/Answer section



     Order detail page (new):

     - app/orders/[id]/page.tsx

     - Order timeline

     - Items with product links

     - Shipping info

     - Review prompts for delivered items



     ---

     Phase 9: Performance Optimization



     For Lighthouse ≥ 90:



     1. Image optimization:

       - Use Next.js Image component

       - Add width/height to images

       - Use appropriate formats (WebP)

     2. Code splitting:

       - Dynamic imports for heavy components

       - Route-based splitting

     3. Lazy loading:

       - Intersection Observer for images

       - Virtual scrolling for long lists

     4. CSS optimization:

       - Remove unused Tailwind classes

       - Minimize CSS bundle

     5. Font optimization:

       - Use font-display: swap

       - Consider system fonts for performance



     ---

     Critical Files to Modify



     New Files to Create:



     app/profile/page.tsx

     app/partner/register/page.tsx

     app/partner/dashboard/page.tsx

     app/dashboard/founder/page.tsx

     app/store/[id]/page.tsx

     app/orders/[id]/page.tsx

     app/api/user-data/[userId]/route.ts

     app/api/auth/reset-password/route.ts

     app/api/partners/register/route.ts

     app/api/stores/route.ts

     components/profile/profile-editor.tsx

     components/dashboard/founder-dashboard.tsx

     components/dashboard/partner-dashboard.tsx

     lib/stores.json

     lib/user-data.json



     Files to Modify:



     hooks/use-cart.tsx

     hooks/use-wishlist.tsx

     hooks/use-role.tsx

     app/login/page.tsx

     lib/products.json (images)

     lib/users.json (add role field)

     types/index.ts

     lib/translations.ts (add new strings)

     app/products/[id]/page.tsx (add review form)

     components/shared/navbar.tsx (add profile link)



     ---

     Open Questions



     1. Data Storage: Keep JSON files or migrate to Supabase (already installed)?

     2. Phone OTP: Use SMS service or mock for demo?

     3. Product Images: Which hosting approach (Unsplash, local, Supabase Storage)?

     4. Store approval: Auto-approve or manual review for new partners?



     ---

     Verification Plan



     1. Test user-specific data:

       - Login as user A, add to cart

       - Logout, login as user B, verify cart is separate

       - Verify wishlist and reviews are per-user

     2. Test phone reset:

       - Trigger password reset with phone

       - Verify OTP flow

       - Confirm password update

     3. Test partner system:

       - Register as partner

       - Create store dashboard access

       - Add products as partner

       - Verify products show store info

     4. Performance test:

       - Run Lighthouse audit

       - Verify score ≥ 90

       - Test on mobile devices