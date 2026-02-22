import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
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

        // Validate required fields
        if (!order_id || !amount || !currency || !customer_name || !customer_email || !customer_phone) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get Cashfree credentials from Supabase secrets
        const appId = Deno.env.get('CASHFREE_APP_ID')
        const secretKey = Deno.env.get('CASHFREE_SECRET_KEY')

        if (!appId || !secretKey) {
            return new Response(
                JSON.stringify({ error: 'Cashfree credentials not configured on server' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Cashfree API endpoint — sandbox for test, production for live
        const cashfreeApiUrl = 'https://sandbox.cashfree.com/pg/orders'
        // For production use: 'https://api.cashfree.com/pg/orders'

        const orderPayload = {
            order_id: order_id,
            order_amount: Number(amount),
            order_currency: currency,
            customer_details: {
                customer_id: `cust_${Date.now()}`,
                customer_name: customer_name,
                customer_email: customer_email,
                customer_phone: customer_phone,
            },
            order_meta: {
                return_url: `${Deno.env.get('FRONTEND_URL') || 'https://rajluxmisweets.com'}/order-confirm?order_id={order_id}`,
                notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-webhook`,
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

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Cashfree API Error:', errorData)
            return new Response(
                JSON.stringify({ error: 'Failed to create Cashfree order', details: errorData }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const cashfreeOrder = await response.json()
        console.log('Cashfree order created:', cashfreeOrder.order_id)

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
