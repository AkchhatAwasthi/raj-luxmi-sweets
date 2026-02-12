# 📧 Raj Luxmi — Email API Setup & Deployment Guide

## Overview

This is a lightweight SMTP email API that sends **beautiful order confirmation emails** to customers and **admin notification emails** when orders are placed on the Raj Luxmi website.

### What it does:
- 📨 **Customer Email** — A premium, branded invoice-style email matching the Raj Luxmi royal theme
- 🔔 **Admin Email** — A concise order notification with quick stats and full order details
- 🛡️ **Fire-and-forget** — Email sending never blocks or breaks the order placement flow

---

## 🚀 Quick Start (Local Development)

### 1. Configure SMTP

Copy the example env file and fill in your credentials:

```bash
cd api
cp .env.example .env
```

Edit `api/.env`:

```env
# For Gmail: Use an App Password (not your regular password)
# Go to: Google Account → Security → 2-Step Verification → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

SENDER_NAME=Raj Luxmi
SENDER_EMAIL=your-email@gmail.com

# Admin receives order notifications  
ADMIN_EMAIL=admin@rajluxmi.com

PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Start the API

```bash
cd api
npm install
node server.js
```

You should see:
```
╔══════════════════════════════════════════════╗
║       🍬 Raj Luxmi Email API Server 🍬       ║
╠══════════════════════════════════════════════╣
║  Port:     3001                              ║
║  SMTP:     smtp.gmail.com                    ║
║  Admin:    admin@rajluxmi.com                ║
║  Status:   Running ✅                        ║
╚══════════════════════════════════════════════╝
```

### 3. Start the Frontend

Make sure your `.env` has:
```env
VITE_EMAIL_API_URL=http://localhost:3001
```

Then run the frontend as usual:
```bash
npm run dev
```

### 4. Test

Health check: `GET http://localhost:3001/api/health`

---

## 📬 Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** (search for it in your Google Account settings)
4. Select "Mail" and "Other" (name it "Raj Luxmi")
5. Copy the 16-character password
6. Use it as `SMTP_PASS` in your `.env`

> ⚠️ **Do NOT use your regular Gmail password.** Google blocks sign-ins from apps using regular passwords.

---

## 🌐 Deployment Options

### Option A: Deploy to Vercel (Recommended — Free)

1. Create a new folder/repo for just the API or deploy the `api/` folder:

```bash
cd api
npx vercel
```

2. Set environment variables in Vercel Dashboard:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
   - `SMTP_USER`, `SMTP_PASS`
   - `SENDER_NAME`, `SENDER_EMAIL`
   - `ADMIN_EMAIL`
   - `ALLOWED_ORIGINS` = `https://your-rajluxmi-domain.com`

3. Update your frontend `.env`:
```env
VITE_EMAIL_API_URL=https://your-api.vercel.app
```

### Option B: Deploy to Render (Free Tier)

1. Push the `api/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Add all env vars from `.env`
5. Deploy!

### Option C: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Point to the `api/` directory
4. Add environment variables
5. Railway auto-detects `server.js`

---

## 📁 File Structure

```
api/
├── .env.example        # Environment variables template
├── .env                # Your actual config (git-ignored)
├── emailTemplates.js   # Beautiful HTML email templates
├── package.json        # Dependencies
├── server.js           # Express.js API server
├── vercel.json         # Vercel deployment config
└── EMAIL_SETUP.md      # This file
```

---

## 🧪 API Reference

### `POST /api/send-order-email`

Sends order confirmation to customer + notification to admin.

**Request Body:**
```json
{
  "order": {
    "orderNumber": "SS1234567890",
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210"
    },
    "items": [
      {
        "name": "Kaju Katli Premium",
        "price": 850,
        "quantity": 2,
        "weight": "500g",
        "category": "Traditional",
        "image": "https://..."
      }
    ],
    "subtotal": 1700,
    "tax": 85,
    "deliveryFee": 0,
    "codFee": 0,
    "discount": 100,
    "total": 1685,
    "paymentMethod": "online",
    "paymentStatus": "paid",
    "deliveryAddress": {
      "plotNumber": "42",
      "street": "Main Road",
      "city": "Jind",
      "state": "Haryana",
      "pincode": "126102"
    },
    "estimatedDeliveryTime": "3-5 business days",
    "orderDate": "2026-02-10T11:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmation email sent successfully!",
  "results": {
    "customer": { "success": true, "messageId": "..." },
    "admin": { "success": true, "messageId": "..." }
  }
}
```

### `GET /api/health`

Returns server status.

---

## 🎨 Email Design

The emails match the Raj Luxmi website theme:

| Element | Color |
|---------|-------|
| Primary Header | `#4A1C1F` (Deep Royal Red) |
| Accent | `#783838` (Royal Maroon) |
| Gold Highlights | `#B38B46` |
| Background | `#FFFDF7` / `#F5EDE5` |
| Text | `#2E1212` / `#5C4638` |

### Customer Email Features:
- ✨ Royal branding with gold decorative elements
- 📦 Product details with images
- 💰 Complete pricing breakdown (invoice-style)
- 📍 Delivery address & payment info cards
- 🔗 "Track Your Order" CTA button
- 📱 Fully responsive on all email clients

### Admin Email Features:
- 🔔 Quick-stats dashboard (Total, Items, Payment status)
- 👤 Complete customer details
- 📦 Full item list with pricing
- 🔗 "View in Admin Panel" CTA button

---

## 🔧 Other SMTP Providers

### Zoho Mail
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid (Higher deliverability)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid login" | Use App Password for Gmail, not regular password |
| CORS error | Add your frontend URL to `ALLOWED_ORIGINS` |
| Emails in spam | Use a proper domain email, add SPF/DKIM records |
| Connection timeout | Check firewall/port 587 is open |
| No admin email | Set `ADMIN_EMAIL` in env variables |
