import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const {
            order_id,
            amount,
            currency,
            customer_name,
            customer_email,
            customer_phone,
        } = await req.json()

        if (!order_id || !amount || !currency || !customer_name || !customer_email || !customer_phone) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const appId = Deno.env.get('CASHFREE_APP_ID')
        const secretKey = Deno.env.get('CASHFREE_SECRET_KEY')

        if (!appId || !secretKey) {
            return new Response(
                JSON.stringify({ error: 'Cashfree credentials not configured on server' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ── Sanitize phone: Cashfree needs exactly 10 digits, no +91, no spaces ──
        const rawPhone = String(customer_phone).trim()
        const digitsOnly = rawPhone.replace(/\D/g, '')
        const cleanPhone = digitsOnly.length === 12 && digitsOnly.startsWith('91')
            ? digitsOnly.slice(2)
            : digitsOnly.slice(-10)

        // ── Sanitize order_id: Cashfree only allows letters, numbers, - and _ ──
        const cleanOrderId = order_id.replace(/[^a-zA-Z0-9_-]/g, '_')

        // ── Sanitize amount: must be a number with max 2 decimal places ──
        const cleanAmount = Math.round(Number(amount) * 100) / 100

        console.log('Creating Cashfree order:', {
            order_id: cleanOrderId,
            amount: cleanAmount,
            phone: cleanPhone,
            email: customer_email,
        })

        // ✅ Production Live API
        const cashfreeApiUrl = 'https://api.cashfree.com/pg/orders'
        // For sandbox/test use: 'https://sandbox.cashfree.com/pg/orders'

        const orderPayload = {
            order_id: cleanOrderId,
            order_amount: cleanAmount,
            order_currency: currency || 'INR',
            customer_details: {
                customer_id: `cust_${Date.now()}`,
                customer_name: customer_name,
                customer_email: customer_email,
                customer_phone: cleanPhone,
            },
            order_meta: {
                return_url: `${Deno.env.get('FRONTEND_URL') || 'https://rajluxmisweets.com'}/order-confirm?order_id={order_id}`,
                notify_url: `${Deno.env.get('SUPABASE_URL') || ''}/functions/v1/cashfree-webhook`,
            },
        }

        const response = await fetch(cashfreeApiUrl, {
            method: 'POST',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(orderPayload),
        })

        const responseText = await response.text()
        console.log('Cashfree API response status:', response.status)
        console.log('Cashfree API response body:', responseText)

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: 'Failed to create Cashfree order', details: responseText }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const cashfreeOrder = JSON.parse(responseText)

        return new Response(
            JSON.stringify({
                order_id: cashfreeOrder.order_id,
                payment_session_id: cashfreeOrder.payment_session_id,
                order_status: cashfreeOrder.order_status,
                order_amount: cashfreeOrder.order_amount,
                order_currency: cashfreeOrder.order_currency,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error creating Cashfree order:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
