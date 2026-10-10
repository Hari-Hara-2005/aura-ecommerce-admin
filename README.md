# AURA LUXE | E-Commerce Admin Dashboard

A modern, responsive administrative control panel for the **AURA LUXE** luxury e-commerce platform. Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Lucide Icons**, and **Clerk Authentication**.

---

## 🌟 Key Features

### 1. Dashboard Overview (`/`)
- Real-time business metrics: Gross Revenue in Indian Rupees (₹), Total Orders, Catalog Items, and Registered Shoppers.
- Interactive revenue trends and recent order activities feed.
- Quick navigation shortcuts to catalog, orders, and promotion modules.

### 2. Orders Management (`/orders`)
- Comprehensive order lifecycle tracking: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, and `Cancelled`.
- **Automated Stock Restoration**: Cancelling an order automatically refunds product inventory back into the PostgreSQL database. Re-activating deducted stock is safely handled via transactional integrity.
- Detailed modal view displaying line items, customer details, delivery address, payment method, and pricing breakdown.
- Search and filter orders by customer name, order ID, or status.

### 3. Product Catalog Management (`/products`)
- Full CRUD operations: Add new products, edit descriptions, adjust pricing (₹ INR), update stock counts, and upload image links.
- Instant search and category-based filtering.
- Low-stock and out-of-stock badge alerts.

### 4. Category Management (`/categories`)
- Dynamic categories synced directly with Neon PostgreSQL.
- Create, modify, and delete product departments and collections.
- Displays associated product counts for each category.

### 5. Coupons & Promotions (`/coupons`)
- Create and manage promotional discount codes.
- Supports both percentage-based discounts and flat INR (₹) discounts.
- Configure minimum order value requirements, discount caps, and expiry dates.

### 6. Customer CRM (`/users`)
- View registered customer profiles, emails, phone numbers, and Clerk user IDs.
- Track lifetime order history and total spend in INR (₹).

### 7. Analytics & Reports (`/analytics`)
- Visual revenue breakdowns, average order values (AOV), and conversion statistics.
- Category sales distribution and top-selling products.

### 8. Authentication & Access Control (`/login`)
- Protected admin routes with Clerk authentication.
- Admin allowlist security via `VITE_ADMIN_EMAILS` to restrict access strictly to authorized personnel.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Authentication**: `@clerk/clerk-react`
- **HTTP Client**: Axios
- **Database / Backend**: Node.js / Express REST API with Neon PostgreSQL


## 📡 API Integration Reference

The Admin Dashboard communicates with the Express backend on the following endpoints:

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Products** | `GET`, `POST` | `/api/products` | Fetch all products / Create product |
| **Products** | `PUT`, `DELETE` | `/api/products/:id` | Update / Remove product |
| **Categories** | `GET`, `POST` | `/api/categories` | Fetch all categories / Create category |
| **Categories** | `PUT`, `DELETE` | `/api/categories/:id` | Update / Delete category |
| **Orders** | `GET` | `/api/orders` | Fetch all customer orders |
| **Orders** | `PATCH` | `/api/orders/:id/status` | Update status (auto-updates stock on cancellation) |
| **Users** | `GET` | `/api/users` | List registered customers |
| **Coupons** | `GET`, `POST`, `DELETE` | `/api/coupons` | Manage discount vouchers |
