## Simple Point Of Sale (POS) Application

A simple point of sale (POS) application built with React, Hono, and Prisma. This application allows users to manage products and categories, and perform basic CRUD operations.

### Features

- User authentication and authorization
- Product management (add, edit, delete, view)
- Category management (add, edit, delete, view)
- Responsive design for mobile and desktop
- Image upload for products and categories
- RESTful API with Hono

### Technologies Used

- Frontend: React Router, TypeScript, Tailwind CSS, React Hook Form, Tanstack Query
- Backend: Hono, TypeScript, Prisma, PostgreSQL, Redis
- Image Upload: Cloudinary
- State Management: Zustand
- Form Handling: React Hook Form
- Validation: Zod
- Deployment: Vercel

### Getting Started

1. Clone the repository:
   ```bash
   git clone
    cd react-hono-simple-product-management
   ```
2. Install dependencies for both client and server:
   ```bash
    cd client
    npm install
    cd ../server
    npm install
   ```
3. Set up environment variables:

   - Create a `.env` file in the `server` directory and add the necessary environment
     variables (e.g., database connection string, Cloudinary credentials).

4. Run database migrations:
   ```bash
    bunx prisma migrate dev --name init
    bun run prisma/seed.ts
   ```
