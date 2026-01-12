import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayU Hash generation
function generateHash(data: string): string {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = new Uint8Array(32);
  
  // Simple hash for demo - in production use crypto
  let hash = 0;
  for (let i = 0; i < dataBuffer.length; i++) {
    hash = ((hash << 5) - hash) + dataBuffer[i];
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

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

    if (!merchantKey || !merchantSalt) {
      throw new Error("PayU credentials not configured");
    }

    const { 
      orderId, 
      amount, 
      productInfo, 
      firstName, 
      email, 
      phone,
      successUrl,
      failureUrl 
    } = await req.json();

    // Validate required fields
    if (!orderId || !amount || !productInfo || !firstName || !email || !phone) {
      throw new Error("Missing required payment fields");
    }

    // Generate transaction ID
    const txnId = `TXN_${orderId}_${Date.now()}`;

    // PayU hash string format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${merchantKey}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${merchantSalt}`;
    const hash = await sha512(hashString);

    // PayU payment URL (use test URL for development, live URL for production)
    const payuUrl = "https://secure.payu.in/_payment"; // Production
    // const payuUrl = "https://sandboxsecure.payu.in/_payment"; // Sandbox/Test

    const paymentData = {
      key: merchantKey,
      txnid: txnId,
      amount: amount.toString(),
      productinfo: productInfo,
      firstname: firstName,
      email: email,
      phone: phone,
      surl: successUrl,
      furl: failureUrl,
      hash: hash,
      service_provider: "payu_paisa",
    };

    return new Response(
      JSON.stringify({
        success: true,
        payuUrl,
        paymentData,
        txnId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("PayU payment error:", error);
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
