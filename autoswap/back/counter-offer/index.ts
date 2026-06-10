// =============================================================
// Edge Function: counter-offer
// The receiver of an offer counters it. Delegates to
// public.counter_offer(original_offer_id, offered_vehicle_id, cash_mode,
// cash_amount, message): marks the original 'countered', creates a new linked
// offer (parent_offer_id), logs an offer_event, and notifies the sender.
//
// Request:  POST {
//   "original_offer_id": "<uuid>",
//   "offered_vehicle_id": "<uuid>" | null,   // optional: a different owned car
//   "cash_mode": "add_money|ask_money|none|flexible",
//   "cash_amount": <int>,
//   "message": "<text>"
// }
// Response: 200 { "counter_offer_id": "<uuid>" } | 4xx/5xx { "error": "..." }
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Missing Authorization header" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const originalOfferId = typeof body?.original_offer_id === "string" ? body.original_offer_id : undefined;
  if (!originalOfferId) return jsonResponse({ error: "original_offer_id is required" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.rpc("counter_offer", {
    p_original_offer_id: originalOfferId,
    p_offered_vehicle_id: typeof body?.offered_vehicle_id === "string" ? body.offered_vehicle_id : null,
    p_cash_mode: typeof body?.cash_mode === "string" ? body.cash_mode : "none",
    p_cash_amount: typeof body?.cash_amount === "number" ? body.cash_amount : 0,
    p_message: typeof body?.message === "string" ? body.message : null,
  });

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ counter_offer_id: data });
});
