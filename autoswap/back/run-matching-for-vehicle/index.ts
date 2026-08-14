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

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return jsonResponse({ error: "Missing Authorization bearer token" }, 401);
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
  }

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
