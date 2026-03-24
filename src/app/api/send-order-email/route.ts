import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buildCustomerEmail, buildAdminEmail } from '@/lib/emailTemplates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Raj Luxmi Email API',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { order } = await request.json();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order data is required' }, { status: 400 });
    }

    if (!order.customerInfo?.email || !order.customerInfo?.name) {
      return NextResponse.json({ success: false, error: 'Customer email and name are required' }, { status: 400 });
    }

    if (!order.orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number is required' }, { status: 400 });
    }

    if (!order.items || order.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must have at least one item' }, { status: 400 });
    }

    const senderName = process.env.SENDER_NAME || 'Raj Luxmi';
    const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
    const adminEmail = process.env.ADMIN_EMAIL;

    const customerHtml = buildCustomerEmail(order);
    const adminHtml = buildAdminEmail(order);

    const emailResults: { customer: any; admin: any } = { customer: null, admin: null };

    // 1. Send customer confirmation
    try {
      const customerResult = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: order.customerInfo.email,
        subject: `✨ Order Confirmed! #${order.orderNumber} — Raj Luxmi`,
        html: customerHtml,
      });
      emailResults.customer = { success: true, messageId: customerResult.messageId };
    } catch (err: any) {
      emailResults.customer = { success: false, error: err.message };
    }

    // 2. Send admin notification
    if (adminEmail) {
      try {
        const adminResult = await transporter.sendMail({
          from: `"${senderName} Orders" <${senderEmail}>`,
          to: adminEmail,
          subject: `🔔 New Order #${order.orderNumber} — ${order.customerInfo.name} — ₹${Number(order.total).toFixed(2)}`,
          html: adminHtml,
        });
        emailResults.admin = { success: true, messageId: adminResult.messageId };
      } catch (err: any) {
        emailResults.admin = { success: false, error: err.message };
      }
    } else {
      emailResults.admin = { skipped: true, reason: 'No ADMIN_EMAIL configured' };
    }

    const overallSuccess = emailResults.customer?.success;
    return NextResponse.json(
      {
        success: overallSuccess,
        message: overallSuccess
          ? 'Order confirmation email sent successfully!'
          : 'Failed to send customer email',
        results: emailResults,
      },
      { status: overallSuccess ? 200 : 500 }
    );
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
