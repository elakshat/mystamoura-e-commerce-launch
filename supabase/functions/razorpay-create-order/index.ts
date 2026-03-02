import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Razorpay secret must come from backend secrets (never from the database)
    const razorpayKeyIdFromSecret = (Deno.env.get("RAZORPAY_KEY_ID") || "").trim();
    const razorpayKeySecret = (Deno.env.get("RAZORPAY_KEY_SECRET") || "").trim();

    if (!razorpayKeyIdFromSecret || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Create a DB client (anon key is enough for reading public settings)
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
    const supabaseAnonKey =
      (Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "").trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Backend configuration missing (SUPABASE_URL / SUPABASE_ANON_KEY)");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch Razorpay settings from site_settings table
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "razorpay")
      .single();

    if (settingsError || !settings) {
      console.error("Failed to fetch Razorpay settings:", settingsError);
      throw new Error("Razorpay settings not configured");
    }

    const razorpayConfig = (settings.value ?? {}) as {
      enabled?: boolean;
      test_mode?: boolean;
    };

    if (!razorpayConfig.enabled) {
      throw new Error("Razorpay payments are disabled");
    }

    // Use the secret-managed keys for auth
    const keyId = razorpayKeyIdFromSecret;
    const keySecret = razorpayKeySecret;

    const { orderNumber, amount, currency = "INR", notes } = await req.json();

    // Validate required fields
    if (!orderNumber || !amount) {
      throw new Error("Missing required fields: orderNumber and amount");
    }

    // Amount should be in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order using REST API
    const auth = btoa(`${keyId}:${keySecret}`);
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: orderNumber,
        notes: notes || { order_number: orderNumber },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay API error:", errorData);
      throw new Error(errorData.error?.description || "Failed to create Razorpay order");
    }

    const razorpayOrder = await razorpayResponse.json();

    console.log(`✅ Razorpay order created: ${razorpayOrder.id} for ${orderNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: keyId, // Send key ID to frontend for checkout
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);
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
