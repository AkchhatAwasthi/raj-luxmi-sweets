/**
 * Raj Luxmi — Email Service Client
 * Sends order data to the SMTP email API for customer & admin notifications.
 */

// The email API URL — uses relative path for unified Next.js deployment
const EMAIL_API_URL = '';

interface OrderEmailData {
    orderNumber: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        weight?: string;
        image?: string;
        category?: string;
    }>;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    codFee?: number;
    discount?: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: {
        plotNumber?: string;
        buildingName?: string;
        street?: string;
        landmark?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    estimatedDeliveryTime?: string;
    couponCode?: string;
    orderDate?: string;
}

interface EmailResponse {
    success: boolean;
    message: string;
    results?: {
        customer: { success: boolean; messageId?: string; error?: string };
        admin: { success: boolean; messageId?: string; error?: string; skipped?: boolean };
    };
}

/**
 * Send order confirmation email to customer + admin notification
 * This is a fire-and-forget call — it won't block the order flow.
 */
export async function sendOrderEmails(orderData: OrderEmailData): Promise<EmailResponse> {
    try {
        const response = await fetch(`${EMAIL_API_URL}/api/send-order-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: orderData }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Email API error:', result);
            return {
                success: false,
                message: result.error || 'Failed to send emails',
            };
        }

        return result;
    } catch (error) {
        // Don't throw — email failure should not break the order flow
        console.error('Email service error:', error);
        return {
            success: false,
            message: 'Email service unavailable. Order was placed but confirmation email could not be sent.',
        };
    }
}

/**
 * Fire-and-forget version — logs result but never blocks or throws.
 * Use this in the checkout flow so it doesn't affect order placement.
 */
export function sendOrderEmailsAsync(orderData: OrderEmailData): void {
    sendOrderEmails(orderData)
        .then(result => {
            if (result.success) {
                console.log('✅ Order emails sent successfully');
            } else {
                console.warn('⚠️ Order emails failed:', result.message);
            }
        })
        .catch(err => {
            console.warn('⚠️ Email service unreachable:', err.message);
        });
}

