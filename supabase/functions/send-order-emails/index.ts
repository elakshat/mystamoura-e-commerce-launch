import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = (Deno.env.get("RESEND_API_KEY") || "").trim();
    const adminEmail = (Deno.env.get("ADMIN_EMAIL") || "mystamoura@gmail.com").trim();
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
    const supabaseServiceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

    const { order_number } = await req.json();

    if (!order_number) {
      throw new Error("Order number is required");
    }

    console.log(`Processing email notification for order: ${order_number}`);

    // Skip if Resend API key not configured
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notifications");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email notifications skipped - RESEND_API_KEY not configured",
          results: { customer: false, admin: false },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Backend configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", order_number)
      .single();

    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      throw new Error("Order not found");
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
    }

    const orderItems = items || [];

    // Get customer email (from order or user profile)
    let customerEmail = order.guest_email;
    let customerName = "Valued Customer";

    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.user_id)
        .single();

      if (profile) {
        customerEmail = profile.email || customerEmail;
        customerName = profile.full_name || customerName;
      }
    }

    // Extract shipping address
    const shippingAddress = order.shipping_address as {
      full_name?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      phone?: string;
    } || {};

    customerName = shippingAddress.full_name || customerName;

    const itemsHtml = orderItems
      .map(
        (item: { product_name: string; quantity: number; unit_price: number }) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.unit_price).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #F5E6A3); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: #1a1a1a; margin: 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background: #f8f8f8; padding: 12px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; text-align: right; padding: 15px 0; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for your order! We're excited to prepare your items.</p>
            
            <p><strong>Order Number:</strong> ${order_number}</p>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">Total: ₹${Number(order.total).toFixed(2)}</div>
            
            ${shippingAddress.address_line1 ? `
            <p><strong>Shipping Address:</strong><br>
            ${shippingAddress.address_line1}${shippingAddress.address_line2 ? ', ' + shippingAddress.address_line2 : ''}<br>
            ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}</p>
            ` : ''}
            
            <p>We'll send you a tracking number once your order ships.</p>
          </div>
          <div class="footer">
            <p>Mystamoura | Luxury Fragrances</p>
            <p>If you have any questions, reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #D4AF37; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; border: 1px solid #eee; }
          .alert { background: #d4af37; color: #1a1a1a; padding: 15px; text-align: center; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert">🔔 New Order Received!</div>
          <div class="header">
            <h2>Order ${order_number}</h2>
          </div>
          <div class="content">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
            <p><strong>Phone:</strong> ${shippingAddress.phone || 'N/A'}</p>
            <p><strong>Total:</strong> ₹${Number(order.total).toFixed(2)}</p>
            <p><strong>Items:</strong> ${orderItems.length}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
            <p><strong>Payment ID:</strong> ${order.payment_id || 'N/A'}</p>
            
            ${shippingAddress.address_line1 ? `
            <p><strong>Shipping Address:</strong><br>
            ${shippingAddress.address_line1}${shippingAddress.address_line2 ? ', ' + shippingAddress.address_line2 : ''}<br>
            ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}</p>
            ` : ''}
            
            <p style="margin-top: 20px;">
              <a href="https://mystamoura.in/admin/orders" style="background: #D4AF37; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order in Admin</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const results = { customer: false, admin: false };

    // Send customer confirmation email
    if (customerEmail) {
      try {
        const customerResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Mystamoura <orders@mystamoura.in>",
            to: [customerEmail],
            subject: `Order Confirmed - ${order_number}`,
            html: customerEmailHtml,
          }),
        });
        results.customer = customerResponse.ok;
        if (!customerResponse.ok) {
          const errText = await customerResponse.text();
          console.error("Customer email failed:", errText);
        }
      } catch (e) {
        console.error("Failed to send customer email:", e);
      }
    } else {
      console.log("No customer email available");
    }

    // Send admin notification email
    try {
      const adminResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Mystamoura Orders <orders@mystamoura.in>",
          to: [adminEmail],
          subject: `🔔 New Order - ${order_number} - ₹${Number(order.total).toFixed(2)}`,
          html: adminEmailHtml,
        }),
      });
      results.admin = adminResponse.ok;
      if (!adminResponse.ok) {
        const errText = await adminResponse.text();
        console.error("Admin email failed:", errText);
      }
    } catch (e) {
      console.error("Failed to send admin email:", e);
    }

    console.log(`✅ Email notifications sent for order: ${order_number}`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notifications processed",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
