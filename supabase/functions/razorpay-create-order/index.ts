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
    // Create Supabase client to fetch settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const razorpayConfig = settings.value as {
      key_id: string;
      key_secret: string;
      enabled: boolean;
      test_mode: boolean;
    };

    if (!razorpayConfig.enabled) {
      throw new Error("Razorpay payments are disabled");
    }

    const keyId = razorpayConfig.key_id;
    const keySecret = razorpayConfig.key_secret;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured in settings");
    }

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
