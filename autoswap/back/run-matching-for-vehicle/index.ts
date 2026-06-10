// =============================================================
// Edge Function: run-matching-for-vehicle
// Runs mutual-match detection for one vehicle, creating match_suggestions
// and notifications for both owners. Delegates to the SECURITY DEFINER
// public.find_mutual_matches_for_vehicle(vehicle_id) RPC.
//
// Matching also runs automatically via DB triggers when desires are added or
// a vehicle is re-activated; this function is for explicit/async invocation
// (e.g. backfills, retries, or an Edge-driven flow).
//
// Uses the service-role key — this is system logic, not a user action.
//
// Request:  POST { "vehicle_id": "<uuid>" }
// Response: 200 { "matches_created": <int> } | 4xx/5xx { "error": "..." }
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

  let vehicleId: string | undefined;
  try {
    const body = await req.json();
    vehicleId = typeof body?.vehicle_id === "string" ? body.vehicle_id : undefined;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!vehicleId) {
    return jsonResponse({ error: "vehicle_id is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Validate the vehicle exists before running matching.
  const { data: vehicle, error: lookupError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (lookupError) {
    return jsonResponse({ error: lookupError.message }, 500);
  }
  if (!vehicle) {
    return jsonResponse({ error: "Vehicle not found" }, 404);
  }

  const { data, error } = await supabase.rpc("find_mutual_matches_for_vehicle", {
    p_vehicle_id: vehicleId,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ matches_created: data ?? 0 });
});
