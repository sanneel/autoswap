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

  // Require a signed-in caller. The service-role key gives this function full
  // DB access, so we must authenticate the request ourselves and confirm the
  // caller owns the vehicle before doing any work (prevents abuse / notif spam).
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return jsonResponse({ error: "Missing Authorization bearer token" }, 401);
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
  }

  // Validate the vehicle exists AND belongs to the caller before matching.
  const { data: vehicle, error: lookupError } = await supabase
    .from("vehicles")
    .select("id, owner_id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (lookupError) {
    return jsonResponse({ error: lookupError.message }, 500);
  }
  if (!vehicle) {
    return jsonResponse({ error: "Vehicle not found" }, 404);
  }
  if (vehicle.owner_id !== userData.user.id) {
    return jsonResponse({ error: "Not authorized for this vehicle" }, 403);
  }

  const { data, error } = await supabase.rpc("find_mutual_matches_for_vehicle", {
    p_vehicle_id: vehicleId,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ matches_created: data ?? 0 });
});
