# PC Master BD - Inventory & Financial Management System

A comprehensive inventory, POS, and financial management system built with Next.js and Supabase.

## Features
- **Inventory Management**: Track products, stock levels, and pricing.
- **Point of Sale (POS)**: Streamlined interface for sales and invoicing.
- **ROI Dashboard**: Real-time sales vs. expense analysis with profit calculation.
- **CRM**: Manage Customers and Suppliers.
- **Accounts**: Track cash/bank balances and transactions.
- **Bilingual UI**: English & Bengali support.

## Prerequisites
1.  **Node.js**: Install from [nodejs.org](https://nodejs.org/).
2.  **Supabase Account**: Create a project at [supabase.com](https://supabase.com/).

## Setup Instructions

### 1. Clone & Install
```bash
git clone <repository-url>
cd inventory-system
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the SQL migration scripts in your Supabase SQL Editor:
1.  `supabase/migrations/core_schema.sql` (Creates all tables)
2.  `supabase/migrations/seed_roi_categories.sql` (Imports initial product data)

### 4. Create Admin User
Since registration is restricted, create your first user in Supabase:
- Go to **Authentication > Users**.
- Click **Add User** and create an account (e.g., `admin@pcmasterbd.com`).

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and log in.

## Deployment
This project is optimized for [Vercel](https://vercel.com).
1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4.  Deploy!
