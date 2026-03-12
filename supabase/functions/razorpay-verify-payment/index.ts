import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://mystamoura.in",
  "https://www.mystamoura.in",
  "http://localhost:5173",
  "http://localhost:8080",
];

const ALLOWED_ORIGIN_SUFFIXES = [".lovableproject.com", ".lovable.app"];

function isOriginAllowed(origin: string | null) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return ALLOWED_ORIGIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = isOriginAllowed(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// HMAC SHA256 verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const message = `${orderId}|${paymentId}`;
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === signature;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get credentials from secrets (trimmed)
    const keySecret = (Deno.env.get("RAZORPAY_KEY_SECRET") || "").trim();
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
    const supabaseServiceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      throw new Error("Razorpay credentials not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      throw new Error("Backend configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_number,
    } = await req.json();

    console.log(`Verifying payment for order: ${order_number}`);

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_number) {
      throw new Error("Missing required payment verification fields");
    }

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.error(`❌ Payment signature verification failed for order: ${order_number}`);
      
      // Update order as failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", order_number);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment verification failed - invalid signature",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update order as paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "completed",
        payment_id: razorpay_payment_id,
        payment_method: "razorpay",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", order_number);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new Error("Failed to update order status");
    }

    // Log activity
    await supabase.from("activity_log").insert({
      action: `Payment received for order ${order_number}`,
      entity_type: "order",
      details: {
        razorpay_order_id,
        razorpay_payment_id,
        order_number,
      },
    });

    console.log(`✅ Payment verified for order: ${order_number}, Payment ID: ${razorpay_payment_id}`);

    // Trigger email notifications (optional - call send-order-emails function)
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ order_number }),
      });
      
      if (!emailResponse.ok) {
        console.warn("Email notification failed but payment succeeded");
      }
    } catch (emailError) {
      console.warn("Failed to send email notifications:", emailError);
      // Don't fail the payment verification if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        order_number,
        payment_id: razorpay_payment_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Razorpay verification error:", error);
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
