# Pariva Jewellery

Hybrid real-time chat is now included for the Pariva Jewellery storefront:

- AI assistant for products, pricing guidance, order help, returns, and exchanges
- Human-agent handover for complex or explicit support requests
- Socket.io real-time messaging with WhatsApp-style sent, delivered, and seen states
- Admin live-chat inbox with one-agent-per-user assignment

Setup notes:

1. Install new chat dependencies in both apps:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Copy [backend/.env.example](/e:/Codes/Projects/Jewellery_Shop/backend/.env.example) to `backend/.env` and fill in your MongoDB, JWT, and OpenAI values.
3. Start backend and frontend as usual:
   - `cd backend && npm run dev`
   - `cd frontend && npm run dev`

Main chat entry points:

- Customer widget: global authenticated floating chat in the frontend app
- Admin live support: `/admin/live-chat`
