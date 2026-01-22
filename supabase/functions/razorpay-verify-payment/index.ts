import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_number,
    } = await req.json();

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
      console.error("Payment signature verification failed");
      
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
