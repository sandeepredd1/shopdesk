# ShopDesk

ShopDesk is a responsive store administration app built with React, TypeScript,
Tailwind CSS, Express, MongoDB, and JWT-backed authentication. Its visual
direction is inspired by the Horizon UI admin dashboard from Figma Community;
the ShopDesk screens and branding are implemented specifically for this app.

## Features

- Signup and login with client/server validation and protected routes
- Separate products and orders for each account
- Dashboard metrics, a 14-day orders chart, and recent orders
- Product search, category filtering, pagination, create, edit, and delete
- Create orders, filter by status, and update fulfillment
- Profile editing and password changes
- Persistent light/dark theme and responsive mobile navigation
- Animated page transitions, interactive controls, loading, empty, and error states
- Seed data: 30 products, 50 orders, and a demo administrator

## Tech stack

- Client: React 18, Vite, TypeScript, Tailwind CSS, React Router, Recharts
- Server: Node.js, Express, MongoDB/Mongoose, bcrypt, JWT

## Requirements

- Node.js LTS and npm
- MongoDB (local or Atlas)

## Local setup

### 1. Configure and start the API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with
a unique random value of at least 32 characters. Then seed the database and
start the server:

```powershell
npm run seed
npm run dev
```

The API runs at `http://localhost:5000` by default.

If the client reports that it cannot reach the API, check the server terminal.
For MongoDB Atlas, add your current IP address under **Security → Network
Access** in Atlas, confirm the database user credentials in `MONGO_URI`, and
restart `npm run dev`. The API does not start listening until MongoDB connects.

### 2. Configure and start the client

In another terminal:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

The Vite app runs at `http://localhost:5173`. Set `VITE_API_URL` in
`client/.env` if the API is hosted elsewhere. Set `CLIENT_URL` in
`server/.env` to the client origin; for multiple allowed origins, separate
them with commas.

## Demo account

- Email: `admin@shopdesk.dev`
- Password: `Admin@123`

Public signup is available at `/signup`. After signup, sign in with the new
credentials. Each account has its own products, orders, dashboard metrics, and
revenue; new accounts start with an empty store. The first server startup
assigns legacy unowned demo records to the seeded administrator account.

## API routes

All routes except signup and login require the ShopDesk HTTP-only JWT cookie.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Restore the current session |
| POST | `/api/auth/logout` | Clear the session cookie |
| GET | `/api/stats` | Dashboard metrics, chart, and recent orders |
| GET, POST | `/api/products` | List/search/filter or create products |
| PUT, DELETE | `/api/products/:id` | Update or remove a product |
| GET | `/api/orders` | List orders, optionally filtered by status |
| POST | `/api/orders` | Create a Pending order |
| PATCH | `/api/orders/:id/status` | Update order status |
| PUT | `/api/users/me` | Update profile or password |

## Design and project status

The selected reference is the [Horizon UI Community dashboard template](https://www.figma.com/community/file/1098131983383434513/horizon-ui-trendiest-open-source-admin-template-dashboard).
The implementation uses a similar clean admin-dashboard visual language; it
does not claim to be an exported or duplicated Figma file. To submit a personal
Figma duplicate, open the template in Figma and add your own draft link here.

Done: dashboard, products, orders, profile, authentication/signup, theme toggle,
responsive navigation, API, and seed script.

Not included in this repository yet: deployment URLs, a Postman collection,
screenshots, and demo video.
