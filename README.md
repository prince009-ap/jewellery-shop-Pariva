# PARIVA Jewellery

PARIVA Jewellery is a full-stack jewellery e-commerce platform built with a premium storefront experience, secure authentication, Razorpay payments, custom jewellery requests, and real-time chatbot support.

## Live Demo

Try the deployed app here:

[https://jewellery-shop-pariva.vercel.app/](https://jewellery-shop-pariva.vercel.app/)

## Features

- JWT-based authentication with role-based access for users and admin
- Password + OTP login flow for extra security
- Razorpay payment integration with backend signature verification
- Cash on Delivery order flow
- Real-time chatbot with bot support and human-agent handover
- Custom jewellery request form with reference image upload
- Admin approval/rejection flow for custom designs
- Order tracking, invoice generation, and email notifications
- Wishlist, cart, profile, and address management
- Responsive frontend built with Vite + React

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Socket.io Client, Recharts, Swiper
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
- Auth & Security: JWT, bcryptjs, cookie-parser, CORS
- Payments: Razorpay
- File Uploads: Multer
- Mail & Documents: Nodemailer, PDFKit, Puppeteer

## Project Structure

```text
Jewellery_Shop/
├── backend/   # Express API, models, controllers, middleware, sockets
├── frontend/  # React + Vite customer/admin UI
├── invoices/  # Generated invoice files
├── jewellery/ # Project assets / data
└── README.md
```

## How It Works

### Authentication
- User registers or logs in with email and password.
- Passwords are hashed with `bcryptjs`.
- On login, backend generates a JWT token.
- Protected routes use middleware to verify token and role.

### Payments
- Frontend sends order amount to backend.
- Backend creates a Razorpay order.
- Razorpay opens checkout on the frontend.
- On success, backend verifies the payment signature before saving the order.

### Chat
- Chat widget connects through Socket.io.
- Backend decides whether the conversation is handled by bot or human agent.
- Messages, typing, delivered, and seen states are synced in real time.

### Custom Design
- Customer submits jewellery type, budget, metal, stone, and reference image.
- Request is stored as `pending`.
- Admin reviews the request, calculates final price, and approves or rejects it.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Jewellery_Shop
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create `.env` files in both backend and frontend folders using the provided `.env.example` files.

Typical backend values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
OPENAI_API_KEY=your_openai_key
```

Typical frontend values:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

### 4. Run the project

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Important API Areas

- `/api/auth` for authentication and profile flow
- `/api/orders` for cart, COD, and order handling
- `/api/payment` for Razorpay order creation and verification
- `/api/chat` for chatbot and live support
- `/api/custom-design` for jewellery customization requests

## Interview Talking Points

- “I used JWT and middleware for secure role-based access.”
- “Payment success is verified only on backend, never trusted from frontend.”
- “Chat is real-time because I used Socket.io.”
- “Custom design is a separate business flow with admin review and email updates.”

## Deployment

- Live app: [https://jewellery-shop-pariva.vercel.app/](https://jewellery-shop-pariva.vercel.app/)

## License

This project is for learning, portfolio, and demonstration purposes.
