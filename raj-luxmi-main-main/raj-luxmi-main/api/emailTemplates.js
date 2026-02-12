/**
 * Raj Luxmi — Beautiful Order Email Templates
 * Theme Colors:
 *   Primary: #783838 / #4A1C1F (Deep Royal Red)
 *   Gold Accent: #B38B46
 *   Background: #FFFDF7 (Warm Cream)
 *   Text: #2E1212 / #5C4638
 */

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ─────────────────────────────────────────────────
// CUSTOMER ORDER CONFIRMATION EMAIL
// ─────────────────────────────────────────────────
function buildCustomerEmail(order) {
  const {
    orderNumber,
    customerInfo,
    items,
    subtotal,
    tax,
    deliveryFee,
    codFee = 0,
    discount = 0,
    total,
    paymentMethod,
    paymentStatus,
    deliveryAddress,
    estimatedDeliveryTime,
    couponCode,
    orderDate
  } = order;

  const itemRows = items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #F0E6DC;">
      <td style="padding: 16px 12px; vertical-align: top;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 56px; height: 56px; border-radius: 8px; overflow: hidden; background: #F5EDE5; flex-shrink: 0;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 56px; height: 56px; object-fit: cover;" />` : `<div style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🍬</div>`}
          </div>
          <div>
            <div style="font-weight: 600; color: #2E1212; font-size: 14px; margin-bottom: 2px;">${item.name}</div>
            ${item.weight ? `<div style="font-size: 12px; color: #8B7355;">${item.weight}</div>` : ''}
            ${item.category ? `<div style="font-size: 11px; color: #B38B46; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">${item.category}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 16px 12px; text-align: center; color: #5C4638; font-size: 14px; vertical-align: middle;">×${item.quantity}</td>
      <td style="padding: 16px 12px; text-align: right; font-weight: 600; color: #2E1212; font-size: 14px; vertical-align: middle;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const addressStr = deliveryAddress
    ? `${deliveryAddress.plotNumber || ''}${deliveryAddress.buildingName ? ', ' + deliveryAddress.buildingName : ''}, ${deliveryAddress.street || ''}, ${deliveryAddress.landmark ? 'Near ' + deliveryAddress.landmark + ', ' : ''}${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} - ${deliveryAddress.pincode || ''}`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Raj Luxmi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EDE5; font-family: 'Georgia', 'Times New Roman', serif;">
  
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5EDE5; padding: 24px 0;">
    <tr>
      <td align="center">
        
        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFDF7; border-radius: 0; overflow: hidden; box-shadow: 0 4px 30px rgba(74, 28, 31, 0.08);">
          
          <!-- ═══════ TOP GOLD BORDER ═══════ -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #B38B46, #D4A64C, #B38B46);"></td>
          </tr>

          <!-- ═══════ HEADER ═══════ -->
          <tr>
            <td style="background: linear-gradient(135deg, #4A1C1F 0%, #783838 100%); padding: 40px 32px; text-align: center;">
              <!-- Decorative top pattern -->
              <div style="margin-bottom: 24px;">
                <span style="color: #B38B46; font-size: 18px; letter-spacing: 8px;">✦ ✦ ✦</span>
              </div>
              
              <h1 style="font-family: 'Georgia', serif; font-size: 32px; color: #FAF9F6; margin: 0 0 4px 0; font-weight: 400; letter-spacing: 3px; text-transform: uppercase;">Raj Luxmi</h1>
              <p style="font-size: 10px; color: #B38B46; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 24px 0;">Royal Sweets • Est. Legacy</p>
              
              <!-- Separator -->
              <div style="width: 60px; height: 1px; background: #B38B46; margin: 0 auto 20px auto;"></div>
              
              <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #FFEBE8; margin: 0; font-weight: 400; letter-spacing: 1px;">Order Confirmed!</h2>
              <p style="color: #D4B6A2; font-size: 13px; margin: 8px 0 0 0;">Thank you for choosing Raj Luxmi, ${customerInfo.name}.</p>
            </td>
          </tr>

          <!-- ═══════ ORDER INFO BAR ═══════ -->
          <tr>
            <td style="background: #3A1517; padding: 16px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #D4B6A2; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">
                    <span style="color: #B38B46;">Order:</span> <span style="color: #FAF9F6; font-weight: 600;">#${orderNumber}</span>
                  </td>
                  <td align="right" style="color: #D4B6A2; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">
                    <span style="color: #B38B46;">Date:</span> <span style="color: #FAF9F6;">${formatDate(orderDate || new Date().toISOString())}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ STATUS BADGE ═══════ -->
          <tr>
            <td style="padding: 28px 32px 0 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: ${paymentStatus === 'paid' ? '#E8F5E9' : '#FFF8E1'}; color: ${paymentStatus === 'paid' ? '#2E7D32' : '#F57F17'}; padding: 8px 24px; border-radius: 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    ${paymentStatus === 'paid' ? '✓ Payment Successful' : '◎ Cash on Delivery'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ ITEMS TABLE ═══════ -->
          <tr>
            <td style="padding: 28px 32px;">
              <h3 style="font-family: 'Georgia', serif; font-size: 16px; color: #4A1C1F; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; font-weight: 400; border-bottom: 2px solid #B38B46; padding-bottom: 10px;">
                Your Items
              </h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="background: #F9F3EA;">
                    <th style="padding: 12px; text-align: left; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Item</th>
                    <th style="padding: 12px; text-align: center; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ═══════ PRICING SUMMARY ═══════ -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F9F3EA; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; color: #5C4638; font-size: 14px;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; color: #2E1212; font-size: 14px;">${formatCurrency(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #5C4638; font-size: 14px;">Tax (GST)</td>
                        <td style="padding: 4px 0; text-align: right; color: #2E1212; font-size: 14px;">${formatCurrency(tax)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #5C4638; font-size: 14px;">Delivery</td>
                        <td style="padding: 4px 0; text-align: right; color: ${deliveryFee > 0 ? '#2E1212' : '#2E7D32'}; font-size: 14px; font-weight: ${deliveryFee > 0 ? '400' : '600'};">${deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</td>
                      </tr>
                      ${codFee > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #5C4638; font-size: 14px;">COD Fee</td>
                        <td style="padding: 4px 0; text-align: right; color: #2E1212; font-size: 14px;">${formatCurrency(codFee)}</td>
                      </tr>
                      ` : ''}
                      ${discount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #2E7D32; font-size: 14px;">Discount ${couponCode ? `(${couponCode})` : ''}</td>
                        <td style="padding: 4px 0; text-align: right; color: #2E7D32; font-size: 14px; font-weight: 600;">-${formatCurrency(discount)}</td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    <!-- Total -->
                    <div style="border-top: 2px solid #D4B6A2; margin-top: 12px; padding-top: 12px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 18px; font-weight: 700; color: #4A1C1F; font-family: 'Georgia', serif;">Total Amount</td>
                          <td style="font-size: 20px; font-weight: 700; color: #4A1C1F; text-align: right; font-family: 'Georgia', serif;">${formatCurrency(total)}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ DELIVERY & PAYMENT INFO ═══════ -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Delivery Address -->
                  <td style="width: 50%; padding-right: 12px; vertical-align: top;">
                    <div style="background: #FFFDF7; border: 1px solid #E6D5B8; border-radius: 8px; padding: 20px;">
                      <h4 style="font-family: 'Georgia', serif; font-size: 13px; color: #B38B46; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 400;">📍 Delivery Address</h4>
                      <p style="font-size: 13px; color: #5C4638; line-height: 1.6; margin: 0;">${addressStr}</p>
                      ${estimatedDeliveryTime ? `<p style="font-size: 12px; color: #B38B46; margin: 12px 0 0 0; font-style: italic;">Est. Delivery: ${estimatedDeliveryTime}</p>` : ''}
                    </div>
                  </td>
                  <!-- Payment Info -->
                  <td style="width: 50%; padding-left: 12px; vertical-align: top;">
                    <div style="background: #FFFDF7; border: 1px solid #E6D5B8; border-radius: 8px; padding: 20px;">
                      <h4 style="font-family: 'Georgia', serif; font-size: 13px; color: #B38B46; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 400;">💳 Payment</h4>
                      <p style="font-size: 13px; color: #5C4638; margin: 0 0 4px 0;"><strong>Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      <p style="font-size: 13px; color: #5C4638; margin: 0;"><strong>Status:</strong> <span style="color: ${paymentStatus === 'paid' ? '#2E7D32' : '#F57F17'}; font-weight: 600;">${paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span></p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ CTA BUTTON ═══════ -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="https://rajluxmi.com/profile?tab=orders" style="display: inline-block; background: linear-gradient(135deg, #4A1C1F, #783838); color: #FAF9F6; text-decoration: none; padding: 14px 40px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px;">
                Track Your Order →
              </a>
            </td>
          </tr>

          <!-- ═══════ FOOTER ═══════ -->
          <tr>
            <td style="background: #4A1C1F; padding: 32px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <span style="color: #B38B46; font-size: 14px; letter-spacing: 6px;">✦ ✦ ✦</span>
              </div>
              <p style="font-family: 'Georgia', serif; font-size: 18px; color: #FAF9F6; margin: 0 0 4px 0; letter-spacing: 2px; text-transform: uppercase;">Raj Luxmi</p>
              <p style="font-size: 9px; color: #B38B46; margin: 0 0 16px 0; letter-spacing: 3px; text-transform: uppercase;">Royal Sweets</p>
              
              <p style="font-size: 12px; color: #D4B6A2; margin: 0 0 4px 0;">Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102</p>
              <p style="font-size: 12px; color: #D4B6A2; margin: 0 0 4px 0;">📧 contact@rajluxmi.com | 📞 +91 9996616153</p>
              
              <div style="border-top: 1px solid rgba(179, 139, 70, 0.3); margin-top: 20px; padding-top: 16px;">
                <p style="font-size: 11px; color: #8B7355; margin: 0;">© ${new Date().getFullYear()} Raj Luxmi. All rights reserved.</p>
                <p style="font-size: 10px; color: #6B5B45; margin: 4px 0 0 0;">This is an automated email. Please do not reply directly.</p>
              </div>
            </td>
          </tr>

          <!-- ═══════ BOTTOM GOLD BORDER ═══════ -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #B38B46, #D4A64C, #B38B46);"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ─────────────────────────────────────────────────
// ADMIN NEW ORDER NOTIFICATION EMAIL
// ─────────────────────────────────────────────────
function buildAdminEmail(order) {
  const {
    orderNumber,
    customerInfo,
    items,
    subtotal,
    tax,
    deliveryFee,
    codFee = 0,
    discount = 0,
    total,
    paymentMethod,
    paymentStatus,
    deliveryAddress,
    estimatedDeliveryTime,
    couponCode,
    orderDate
  } = order;

  const itemRows = items.map((item) => `
    <tr style="border-bottom: 1px solid #F0E6DC;">
      <td style="padding: 10px 8px; font-size: 13px; color: #2E1212;">${item.name}${item.weight ? ` (${item.weight})` : ''}</td>
      <td style="padding: 10px 8px; text-align: center; font-size: 13px; color: #5C4638;">${item.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; font-size: 13px; color: #2E1212;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px 8px; text-align: right; font-size: 13px; color: #2E1212; font-weight: 600;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const addressStr = deliveryAddress
    ? `${deliveryAddress.plotNumber || ''}${deliveryAddress.buildingName ? ', ' + deliveryAddress.buildingName : ''}, ${deliveryAddress.street || ''}, ${deliveryAddress.landmark ? 'Near ' + deliveryAddress.landmark + ', ' : ''}${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} - ${deliveryAddress.pincode || ''}`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Alert - Raj Luxmi Admin</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EDE5; font-family: 'Segoe UI', Arial, sans-serif;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5EDE5; padding: 24px 0;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFDF7; overflow: hidden; box-shadow: 0 4px 30px rgba(74, 28, 31, 0.08);">
          
          <!-- Top border -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #783838, #B38B46, #783838);"></td>
          </tr>

          <!-- ═══════ HEADER ═══════ -->
          <tr>
            <td style="background: #4A1C1F; padding: 28px 32px; text-align: center;">
              <h1 style="font-family: 'Georgia', serif; font-size: 22px; color: #FAF9F6; margin: 0 0 4px 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 400;">🔔 New Order Received</h1>
              <p style="font-size: 10px; color: #B38B46; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Raj Luxmi Admin</p>
            </td>
          </tr>

          <!-- ═══════ ALERT BAR ═══════ -->
          <tr>
            <td style="background: #783838; padding: 14px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #FFEBE8; font-size: 14px; font-weight: 600;">
                    Order #${orderNumber}
                  </td>
                  <td align="right">
                    <span style="background: ${paymentStatus === 'paid' ? '#2E7D32' : '#F57F17'}; color: white; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                      ${paymentMethod === 'cod' ? 'COD' : paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ ORDER SUMMARY ═══════ -->
          <tr>
            <td style="padding: 24px 32px;">
              <!-- Quick Stats -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="width: 33%; text-align: center; padding: 12px; background: #F9F3EA; border-right: 1px solid #E6D5B8;">
                    <div style="font-size: 22px; font-weight: 700; color: #4A1C1F;">${formatCurrency(total)}</div>
                    <div style="font-size: 10px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Total</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 12px; background: #F9F3EA; border-right: 1px solid #E6D5B8;">
                    <div style="font-size: 22px; font-weight: 700; color: #4A1C1F;">${items.length}</div>
                    <div style="font-size: 10px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Items</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 12px; background: #F9F3EA;">
                    <div style="font-size: 22px; font-weight: 700; color: ${paymentMethod === 'cod' ? '#F57F17' : '#2E7D32'};">${paymentMethod === 'cod' ? 'COD' : 'PAID'}</div>
                    <div style="font-size: 10px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Payment</div>
                  </td>
                </tr>
              </table>

              <!-- Customer Info -->
              <h3 style="font-size: 14px; color: #B38B46; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 600; border-bottom: 1px solid #E6D5B8; padding-bottom: 8px;">Customer Details</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #8B7355; width: 100px;">Name:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #2E1212; font-weight: 600;">${customerInfo.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #8B7355;">Email:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #2E1212;">${customerInfo.email}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #8B7355;">Phone:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #2E1212;">${customerInfo.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #8B7355;">Address:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #2E1212; line-height: 1.5;">${addressStr}</td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="font-size: 14px; color: #B38B46; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 600; border-bottom: 1px solid #E6D5B8; padding-bottom: 8px;">Order Items</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <thead>
                  <tr style="background: #F9F3EA;">
                    <th style="padding: 8px; text-align: left; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th style="padding: 8px; text-align: center; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Pricing -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F9F3EA; padding: 16px; border-radius: 6px;">
                <tr>
                  <td style="padding: 3px 0; font-size: 13px; color: #5C4638;">Subtotal</td>
                  <td style="padding: 3px 0; text-align: right; font-size: 13px; color: #2E1212;">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-size: 13px; color: #5C4638;">Tax</td>
                  <td style="padding: 3px 0; text-align: right; font-size: 13px; color: #2E1212;">${formatCurrency(tax)}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-size: 13px; color: #5C4638;">Delivery</td>
                  <td style="padding: 3px 0; text-align: right; font-size: 13px; color: #2E1212;">${deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</td>
                </tr>
                ${codFee > 0 ? `<tr><td style="padding: 3px 0; font-size: 13px; color: #5C4638;">COD Fee</td><td style="padding: 3px 0; text-align: right; font-size: 13px; color: #2E1212;">${formatCurrency(codFee)}</td></tr>` : ''}
                ${discount > 0 ? `<tr><td style="padding: 3px 0; font-size: 13px; color: #2E7D32;">Discount${couponCode ? ` (${couponCode})` : ''}</td><td style="padding: 3px 0; text-align: right; font-size: 13px; color: #2E7D32;">-${formatCurrency(discount)}</td></tr>` : ''}
                <tr>
                  <td colspan="2" style="padding-top: 8px;">
                    <div style="border-top: 2px solid #D4B6A2;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #4A1C1F;">TOTAL</td>
                  <td style="padding: 8px 0 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #4A1C1F;">${formatCurrency(total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ CTA ═══════ -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <a href="https://rajluxmi.com/admin/orders" style="display: inline-block; background: #783838; color: #FAF9F6; text-decoration: none; padding: 12px 36px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px;">
                View in Admin Panel →
              </a>
            </td>
          </tr>

          <!-- ═══════ FOOTER ═══════ -->
          <tr>
            <td style="background: #4A1C1F; padding: 20px 32px; text-align: center;">
              <p style="font-size: 12px; color: #D4B6A2; margin: 0;">Raj Luxmi Admin Notification</p>
              <p style="font-size: 10px; color: #8B7355; margin: 4px 0 0 0;">${formatDate(orderDate || new Date().toISOString())}</p>
            </td>
          </tr>

          <!-- Bottom border -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #783838, #B38B46, #783838);"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { buildCustomerEmail, buildAdminEmail };
