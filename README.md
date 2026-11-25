# Inventory Management System

## Project Description
This project is an Inventory Management System built using React and Vite. It allows users to manage products, organize categories, track inventory quantities, and monitor low-stock items.

## Database
This project uses Supabase with a PostgreSQL database. Supabase also provides user authentication and secure data access.

## Technologies Used
- React
- JavaScript
- Vite
- Supabase
- PostgreSQL
- CSS

## Setup Instructions

1. Download or clone the repository.
2. Run `npm install`.
3. Copy `.env.example` and rename the copy to `.env.local`.
4. Add your Supabase Project URL and publishable key to `.env.local`.
5. Run `supabase/schema.sql` in the Supabase SQL Editor.
6. Start the application:

```bash
npm run dev
```

7. Open the local URL provided in your terminal.

## Features
- User registration and login
- Add, edit, and delete products
- Manage product categories
- Search and filter inventory
- Track product quantities
- View low-stock alerts

## Author
Drew Dow
