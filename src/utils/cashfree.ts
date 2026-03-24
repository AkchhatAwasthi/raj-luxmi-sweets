import { CartItem } from '@/store/useStore';

declare global {
    interface Window {
        Cashfree: any;
    }
}

export interface CashfreeOrderData {
    orderId: string;
    amount: number;
    currency: string;
    items: CartItem[];
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    deliveryAddress: {
        address: string;
    };
}

export interface CashfreePaymentResponse {
    cf_payment_id: string;
    cf_order_id: string;
    order_status: string;
}

// Load Cashfree JS SDK dynamically
export const loadCashfreeScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Cashfree) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        // Use sandbox for test mode, production for live
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
};

// Create a Cashfree order via Supabase Edge Function
export const createCashfreeOrder = async (
    orderData: CashfreeOrderData
): Promise<{ order_id: string; payment_session_id: string }> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-cashfree-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
            order_id: orderData.orderId,
            amount: orderData.amount,
            currency: orderData.currency,
            customer_name: orderData.customerInfo.name,
            customer_email: orderData.customerInfo.email,
            customer_phone: orderData.customerInfo.phone,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Cashfree create order error:', errorData);
        throw new Error('Failed to create Cashfree payment order. Please try again.');
    }

    const data = await response.json();

    if (!data.payment_session_id) {
        throw new Error('Invalid response from payment server.');
    }

    return data; // { order_id, payment_session_id }
};

// Initiate Cashfree Drop-in Checkout
export const initiateCashfreePayment = async (
    orderData: CashfreeOrderData,
    onSuccess: (response: CashfreePaymentResponse) => void,
    onError: (error: any) => void
): Promise<void> => {
    try {
        // 1. Load SDK
        const isLoaded = await loadCashfreeScript();
        if (!isLoaded) {
            throw new Error('Failed to load Cashfree SDK. Please check your internet connection.');
        }

        // 2. Create order on server → get payment_session_id
        const { order_id, payment_session_id } = await createCashfreeOrder(orderData);

        // 3. Get App ID from env
        const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
        if (!appId) {
            throw new Error('Cashfree App ID not configured.');
        }

        // 4. Auto-detect environment from App ID
        //    Cashfree TEST keys always start with 'TEST' — live keys never do
        const environment = appId.startsWith('TEST') ? 'sandbox' : 'production';
        console.log('Cashfree mode:', environment, '| App ID prefix:', appId.slice(0, 8));

        // 5. Initialize Cashfree instance
        const cashfree = await window.Cashfree({ mode: environment });

        // 6. Launch Drop-in checkout
        const checkoutOptions = {
            paymentSessionId: payment_session_id,
            redirectTarget: '_modal', // Opens as modal popup
        };

        const result = await cashfree.checkout(checkoutOptions);

        if (result.error) {
            console.error('Cashfree checkout error:', result.error);
            onError(new Error(result.error.message || 'Payment failed. Please try again.'));
            return;
        }

        if (result.paymentDetails) {
            console.log('Cashfree payment successful:', result.paymentDetails);
            const payResponse: CashfreePaymentResponse = {
                cf_payment_id: result.paymentDetails.paymentMessage || order_id,
                cf_order_id: order_id,
                order_status: 'PAID',
            };
            onSuccess(payResponse);
        } else {
            // Payment was closed/dismissed without completion
            onError(new Error('Payment cancelled by user.'));
        }

    } catch (error: any) {
        console.error('Cashfree payment error:', error);
        onError(error);
    }
};

