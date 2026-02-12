/**
 * Raj Luxmi — SMTP Email API Server
 * Sends order confirmation emails to customers and admin notifications.
 * 
 * Endpoints:
 *   POST /api/send-order-email   → Sends both customer & admin emails
 *   GET  /api/health             → Health check
 * 
 * Deployment:
 *   • Vercel (serverless) — use vercel.json with api/ directory
 *   • Render / Railway — just `node server.js`
 *   • Any Node.js host
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { buildCustomerEmail, buildAdminEmail } = require('./emailTemplates');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ───────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// ─── SMTP Transporter ───────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify SMTP connection on startup
transporter.verify()
    .then(() => console.log('✅ SMTP connection verified'))
    .catch(err => console.error('❌ SMTP connection error:', err.message));

// ─── Health Check ───────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Raj Luxmi Email API',
        timestamp: new Date().toISOString()
    });
});

// ─── Send Order Emails ──────────────────────────
app.post('/api/send-order-email', async (req, res) => {
    try {
        const { order } = req.body;

        if (!order) {
            return res.status(400).json({
                success: false,
                error: 'Order data is required'
            });
        }

        // Validate essential fields
        if (!order.customerInfo?.email || !order.customerInfo?.name) {
            return res.status(400).json({
                success: false,
                error: 'Customer email and name are required'
            });
        }

        if (!order.orderNumber) {
            return res.status(400).json({
                success: false,
                error: 'Order number is required'
            });
        }

        if (!order.items || order.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Order must have at least one item'
            });
        }

        const senderName = process.env.SENDER_NAME || 'Raj Luxmi';
        const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
        const adminEmail = process.env.ADMIN_EMAIL;

        // Build email HTML
        const customerHtml = buildCustomerEmail(order);
        const adminHtml = buildAdminEmail(order);

        const emailResults = { customer: null, admin: null };

        // 1. Send customer confirmation email
        try {
            const customerResult = await transporter.sendMail({
                from: `"${senderName}" <${senderEmail}>`,
                to: order.customerInfo.email,
                subject: `✨ Order Confirmed! #${order.orderNumber} — Raj Luxmi`,
                html: customerHtml,
            });
            emailResults.customer = {
                success: true,
                messageId: customerResult.messageId,
                to: order.customerInfo.email
            };
            console.log(`📧 Customer email sent: ${order.customerInfo.email} (Order #${order.orderNumber})`);
        } catch (err) {
            console.error('❌ Customer email failed:', err.message);
            emailResults.customer = {
                success: false,
                error: err.message
            };
        }

        // 2. Send admin notification email
        if (adminEmail) {
            try {
                const adminResult = await transporter.sendMail({
                    from: `"${senderName} Orders" <${senderEmail}>`,
                    to: adminEmail,
                    subject: `🔔 New Order #${order.orderNumber} — ${order.customerInfo.name} (${order.paymentMethod === 'cod' ? 'COD' : 'Paid'}) — ₹${Number(order.total).toFixed(2)}`,
                    html: adminHtml,
                });
                emailResults.admin = {
                    success: true,
                    messageId: adminResult.messageId,
                    to: adminEmail
                };
                console.log(`📧 Admin email sent: ${adminEmail} (Order #${order.orderNumber})`);
            } catch (err) {
                console.error('❌ Admin email failed:', err.message);
                emailResults.admin = {
                    success: false,
                    error: err.message
                };
            }
        } else {
            emailResults.admin = { skipped: true, reason: 'No ADMIN_EMAIL configured' };
        }

        // Return result
        const overallSuccess = emailResults.customer?.success;
        res.status(overallSuccess ? 200 : 500).json({
            success: overallSuccess,
            message: overallSuccess
                ? 'Order confirmation email sent successfully!'
                : 'Failed to send customer email',
            results: emailResults
        });

    } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// ─── Start Server ───────────────────────────────
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║       🍬 Raj Luxmi Email API Server 🍬       ║
  ╠══════════════════════════════════════════════╣
  ║  Port:     ${String(PORT).padEnd(33)}║
  ║  SMTP:     ${(process.env.SMTP_HOST || 'smtp.gmail.com').padEnd(33)}║
  ║  Admin:    ${(process.env.ADMIN_EMAIL || 'Not configured').padEnd(33)}║
  ║  Status:   Running ✅                        ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
