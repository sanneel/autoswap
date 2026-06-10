// =============================================================
// Edge Function: accept-offer
// Atomically accepts an offer the caller received, creating the
// conversation and notifying the sender. Delegates to the SECURITY DEFINER
// public.accept_offer(offer_id) RPC, which enforces ownership + pending state.
//
// The caller's JWT is forwarded so auth.uid() resolves inside the RPC.
//
// Request:  POST { "offer_id": "<uuid>" }   (Authorization: Bearer <jwt>)
// Response: 200 { "conversation_id": "<uuid>" }  | 4xx/5xx { "error": "..." }
// =============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  let offerId: string | undefined;
  try {
    const body = await req.json();
    offerId = typeof body?.offer_id === "string" ? body.offer_id : undefined;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!offerId) {
    return jsonResponse({ error: "offer_id is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.rpc("accept_offer", {
    offer_id_input: offerId,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ conversation_id: data });
});
