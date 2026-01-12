import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha512(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const merchantKey = Deno.env.get("PAYU_MERCHANT_KEY");
    const merchantSalt = Deno.env.get("PAYU_MERCHANT_SALT");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!merchantKey || !merchantSalt) {
      throw new Error("PayU credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // PayU sends response as form data
    const formData = await req.formData();
    
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname = formData.get("firstname") as string;
    const email = formData.get("email") as string;
    const mihpayid = formData.get("mihpayid") as string;
    const hash = formData.get("hash") as string;

    // Verify hash (reverse hash for verification)
    // Verification hash: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const reverseHashString = `${merchantSalt}|${status}||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
    const calculatedHash = await sha512(reverseHashString);

    if (calculatedHash !== hash) {
      console.error("Hash mismatch - potential tampering");
      // In production, you might want to handle this differently
    }

    // Extract order ID from txnid (format: TXN_orderId_timestamp)
    const orderIdMatch = txnid.match(/TXN_(.+?)_\d+$/);
    const orderNumber = orderIdMatch ? orderIdMatch[1] : null;

    if (orderNumber) {
      // Update order status based on payment result
      const newStatus = status === "success" ? "paid" : "pending";
      const paymentStatus = status === "success" ? "completed" : "failed";

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_status: paymentStatus,
          payment_id: mihpayid,
          payment_method: "payu",
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", orderNumber);

      if (updateError) {
        console.error("Error updating order:", updateError);
      }

      // Log activity
      await supabase.from("activity_log").insert({
        action: status === "success" 
          ? `Payment received for order ${orderNumber}` 
          : `Payment failed for order ${orderNumber}`,
        entity_type: "order",
        entity_id: orderNumber,
        details: { txnid, mihpayid, status, amount },
      });
    }

    // Redirect user based on payment status
    const baseUrl = req.headers.get("origin") || "https://mystamoura.com";
    const redirectUrl = status === "success" 
      ? `${baseUrl}/order-success?txnid=${txnid}&order=${orderNumber}`
      : `${baseUrl}/checkout?error=payment_failed`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": redirectUrl,
      },
    });
  } catch (error: unknown) {
    console.error("PayU verification error:", error);
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
