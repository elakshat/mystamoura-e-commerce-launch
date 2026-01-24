# Mystamoura Backend

Production-ready Node.js + Express backend for Mystamoura e-commerce.

## 🚀 Quick Deploy to Render

### 1. Create a new Git repository

```bash
# Copy backend folder to a new location
cp -r backend/ ~/mystamoura-backend
cd ~/mystamoura-backend

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create mystamoura-backend --private --source=. --push
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mystamoura-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for production)

### 3. Set Environment Variables

In Render dashboard, go to **Environment** and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `ALLOWED_ORIGINS` | `https://mystamoura.in,https://www.mystamoura.in` |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |
| `SUPABASE_URL` | `https://grykfdukintifaxuljqx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Payments
```
POST /api/payment/create-order
POST /api/payment/verify
GET  /api/payment/status/:orderId
```

### Orders
```
POST /api/orders/create
GET  /api/orders/:orderNumber
PUT  /api/orders/:orderNumber/status
```

### Contact
```
POST /api/contact/submit
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── server.js           # Main entry point
├── config/
│   ├── razorpay.config.js
│   └── supabase.config.js
├── routes/
│   ├── payment.routes.js
│   ├── order.routes.js
│   └── contact.routes.js
├── controllers/
│   ├── payment.controller.js
│   ├── order.controller.js
│   └── contact.controller.js
├── middleware/
│   ├── validators.js
│   └── errorHandler.js
├── utils/
│   └── validateEnv.js
├── package.json
├── .env.example
└── README.md
```

## 🔐 Security Features

- Helmet.js for security headers
- Rate limiting (100 requests/15 min)
- CORS with whitelist
- Input validation with express-validator
- Error sanitization in production
- HMAC signature verification for payments

## 🔗 Frontend Integration

Update your frontend to call this backend:

```typescript
// Instead of Supabase edge functions:
const BACKEND_URL = 'https://mystamoura-backend.onrender.com';

// Create payment order
const response = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderNumber, amount })
});
```

## 📝 Notes

- The backend uses the same Supabase database as the frontend
- PayU has been completely removed - Razorpay only
- All secrets are managed via environment variables
- Health endpoint at `/health` for monitoring
