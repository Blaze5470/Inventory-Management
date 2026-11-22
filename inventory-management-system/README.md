# Stockroom — Inventory Management System

A professional, responsive inventory dashboard built with **React, Vite, Supabase, and PostgreSQL**. Users can create an account, sign in, organize products into categories, and perform full CRUD operations. Data is stored persistently in Supabase rather than temporary browser state.

## Features

- Email/password authentication with Supabase Auth
- User-specific inventory protected by PostgreSQL Row Level Security (RLS)
- Product CRUD: create, view, edit, and delete
- Category CRUD: create, view, and delete
- Search by product name, SKU, or description
- Filter by category and stock level
- Sort product columns
- Dashboard metrics: product count, units in stock, low-stock count, and inventory value
- Low-stock indicators and configurable reorder levels
- Client-side validation and useful database error messages
- Responsive desktop and mobile layouts

## Tech stack

- React 18
- Vite 6
- Supabase JavaScript client
- Supabase Auth
- Supabase PostgreSQL with Row Level Security
- Lucide icons
- Plain CSS

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase account and project

## 1. Create the Supabase database

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase project.
3. Open `supabase/schema.sql` from this repository.
4. Paste the complete SQL script into the SQL Editor and run it.
5. In **Authentication → Providers**, ensure Email is enabled.
6. For a classroom/demo project, you may turn off email confirmation under **Authentication → Sign In / Providers → Email** if you want newly registered accounts to sign in immediately. If email confirmation remains enabled, users must confirm their email before signing in.

The SQL creates two related tables:

### `categories`

| Column | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `user_id` | Owner; references `auth.users` |
| `name` | Category name |
| `description` | Optional category description |
| `created_at` | Creation timestamp |

### `products`

| Column | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `user_id` | Owner; references `auth.users` |
| `category_id` | Optional foreign key to a category |
| `name` | Product name |
| `sku` | Unique stock keeping unit per user |
| `description` | Product details |
| `price` | Unit price |
| `quantity` | Current units in stock |
| `reorder_level` | Low-stock threshold |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |

A category can contain many products. The composite foreign key ensures that a product can only be linked to a category owned by the same user. Deleting a category makes its products uncategorized.

### Security model

- Both tables have Row Level Security enabled.
- Policies permit authenticated users to select, insert, update, and delete only rows where `user_id = auth.uid()`.
- The app obtains the authenticated user from the Supabase session and includes that user's ID when creating records.
- Database checks enforce valid prices, quantities, lengths, and unique SKU/category names.
- The browser uses only the Supabase project URL and public anon/publishable key. **Never use or publish the `service_role` key.**
- Do not disable RLS on these tables.

## 2. Configure the app

From the project directory:

```bash
npm install
```

Copy `.env.example` to `.env.local`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

In Supabase, open **Project Settings → API** (or the API Keys page) and copy:

- Project URL → `VITE_SUPABASE_URL`
- Publishable key / legacy anon public key → `VITE_SUPABASE_ANON_KEY`

Put those values in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

These are public browser credentials designed to be used with RLS. Never paste a secret key or `service_role` key into the React app. `.env.local` is ignored by Git.

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

> If PowerShell blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd run dev`, and `npm.cmd run build`.

## 3. Test the application

1. Register with an email address and password of at least 8 characters.
2. If email confirmation is enabled, confirm the address using the message Supabase sends.
3. Sign in.
4. Create at least two categories (for example, Electronics and Office Supplies).
5. Add several products with different prices, quantities, SKUs, categories, and reorder levels.
6. Edit a product and save the changes.
7. Refresh the browser. Confirm the changes remain.
8. Search by product name or SKU; filter by category and low-stock status; try sorting columns.
9. Delete a product and confirm the browser asks before deleting.
10. Delete a category and verify its products become uncategorized.
11. Create a second test account and verify it cannot see or change the first account's records.

For validation testing, try a blank product name, duplicate SKU, negative price, negative quantity, or decimal quantity. The form and database should reject invalid values. You can also temporarily disconnect your network to observe an error message.

## 4. Build for production

```bash
npm run build
```

Vite writes the production files to `dist/`.

## 5. Deploy to Vercel

1. Push the project to a GitHub repository (see below).
2. Sign in to [Vercel](https://vercel.com) and choose **Add New → Project**.
3. Import the GitHub repository.
4. Vercel should detect Vite automatically.
5. Confirm build command `npm run build` and output directory `dist`.
6. In **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values used locally.
7. Deploy.
8. Open the deployed URL and test sign-up/sign-in and every CRUD operation.
9. In Supabase **Authentication → URL Configuration**, set the Site URL to your deployed URL. Add your local development URL and deployed URL to the allowed redirect URLs if needed.

The application uses Supabase's standard email/password flow and does not require a custom OAuth redirect.

## 6. Upload to GitHub

Do not upload `node_modules`, `dist`, or `.env.local`.

```bash
git init
git add .
git commit -m "Build Stockroom inventory management app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/inventory-management-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If the repository already exists and has a remote configured, do not add the remote a second time.

## 7. Submission checklist

- [ ] GitHub repository URL
- [ ] Deployed application URL
- [ ] Screenshot of Supabase table structure and example records
- [ ] README and `supabase/schema.sql` included in repository
- [ ] CRUD operations tested in deployed app
- [ ] Refresh persistence tested
- [ ] Invalid input and error handling tested
- [ ] RLS enabled and tested with a second account
- [ ] No `.env.local`, service-role key, or other secrets committed

## Troubleshooting

**“Connect your Supabase project” appears:** check `.env.local` spelling and values, then restart Vite. Environment variables are loaded when the dev server starts.

**Invalid API key / fetch error:** verify the project URL and public anon/publishable key belong to the same Supabase project.

**Permission denied / no rows appear:** confirm the SQL script ran successfully, RLS is enabled, and you are signed in.

**New account cannot sign in immediately:** check whether email confirmation is enabled and confirm the email address.

**Duplicate SKU or category error:** SKUs and category names must be unique within each user's account.

**Category cannot be deleted:** confirm the latest schema was applied. The included composite relationship is configured to set linked products' category to null.

## Project structure

```text
inventory-management-system/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── CategoryManager.jsx
│   │   ├── ProductModal.jsx
│   │   └── StatCard.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── style.css
│   └── utils.js
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```
