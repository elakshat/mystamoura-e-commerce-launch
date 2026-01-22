import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  order_number: string;
  customer_email: string;
  customer_name: string;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  shipping_address: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@mystamoura.com";

    const {
      order_number,
      customer_email,
      customer_name,
      total,
      items,
      shipping_address,
    }: OrderEmailRequest = await req.json();

    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unit_price.toFixed(2)}</td>
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
            <p>Dear ${customer_name},</p>
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
            
            <div class="total">Total: ₹${total.toFixed(2)}</div>
            
            <p><strong>Shipping Address:</strong><br>
            ${shipping_address.address_line1}<br>
            ${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}</p>
            
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
            <p><strong>Customer:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${items.length}</p>
            
            <p><strong>Shipping Address:</strong><br>
            ${shipping_address.address_line1}<br>
            ${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}</p>
            
            <p style="margin-top: 20px;">
              <a href="https://mystamoura.com/admin/orders" style="background: #D4AF37; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order in Admin</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const results = { customer: false, admin: false };

    // Only send emails if Resend API key is configured
    if (resendApiKey) {
      // Send customer confirmation email
      try {
        const customerResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Mystamoura <orders@mystamoura.com>",
            to: [customer_email],
            subject: `Order Confirmed - ${order_number}`,
            html: customerEmailHtml,
          }),
        });
        results.customer = customerResponse.ok;
      } catch (e) {
        console.error("Failed to send customer email:", e);
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
            from: "Mystamoura Orders <orders@mystamoura.com>",
            to: [adminEmail],
            subject: `🔔 New Order - ${order_number} - ₹${total.toFixed(2)}`,
            html: adminEmailHtml,
          }),
        });
        results.admin = adminResponse.ok;
      } catch (e) {
        console.error("Failed to send admin email:", e);
      }
    } else {
      console.log("RESEND_API_KEY not configured - skipping email notifications");
    }

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
