"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(formData: FormData, key: string) {
  const value = asText(formData, key);

  return value.length > 0 ? value : null;
}

function asNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(asText(formData, key));

  return Number.isFinite(value) ? value : fallback;
}

function safePath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

function getListingCashAdjustment(formData: FormData) {
  const direction = asText(formData, "cash_direction");
  const amount = Math.max(0, Math.round(asNumber(formData, "cash_amount", 0)));

  if (direction === "owner_wants") {
    return amount;
  }

  if (direction === "owner_adds") {
    return -amount;
  }

  return 0;
}

function getOfferCashAdjustment(formData: FormData) {
  const direction = asText(formData, "cash_direction");
  const amount = Math.max(0, Math.round(asNumber(formData, "cash_amount", 0)));

  if (direction === "sender_adds") {
    return amount;
  }

  if (direction === "sender_wants") {
    return -amount;
  }

  return 0;
}

async function getAuthenticatedClient(nextPath = "/") {
  const supabase = await createClient();

  if (!supabase) {
    redirect(`/auth?next=${encodeURIComponent(nextPath)}&error=supabase-not-configured`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

export async function signInWithOAuth(formData: FormData) {
  const provider = asText(formData, "provider");
  const next = safePath(asText(formData, "next") || "/");
  const supabase = await createClient();

  if (!supabase || (provider !== "google" && provider !== "apple")) {
    redirect(`/auth?next=${encodeURIComponent(next)}&error=auth-unavailable`);
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.url) {
    redirect(`/auth?next=${encodeURIComponent(next)}&error=oauth-failed`);
  }

  redirect(data.url);
}

export async function sendPhoneOtp(formData: FormData) {
  const phone = asText(formData, "phone");
  const next = safePath(asText(formData, "next") || "/");
  const supabase = await createClient();

  if (!supabase || !phone) {
    redirect(`/auth?next=${encodeURIComponent(next)}&error=phone-required`);
  }

  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    redirect(`/auth?next=${encodeURIComponent(next)}&error=otp-failed`);
  }

  redirect(`/auth?next=${encodeURIComponent(next)}&phone=${encodeURIComponent(phone)}&sent=1`);
}

export async function verifyPhoneOtp(formData: FormData) {
  const phone = asText(formData, "phone");
  const token = asText(formData, "token");
  const next = safePath(asText(formData, "next") || "/");
  const supabase = await createClient();

  if (!supabase || !phone || !token) {
    redirect(`/auth?next=${encodeURIComponent(next)}&error=otp-missing`);
  }

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error) {
    redirect(`/auth?next=${encodeURIComponent(next)}&phone=${encodeURIComponent(phone)}&error=otp-invalid`);
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function createVehicle(formData: FormData) {
  const { supabase, user } = await getAuthenticatedClient("/listings/new");
  const make = asText(formData, "make");
  const model = asText(formData, "model");
  const year = asNumber(formData, "year");
  const mileage = asNumber(formData, "mileage");
  const description = asOptionalText(formData, "description");
  const desiredMake = asOptionalText(formData, "desired_make");
  const desiredModel = asOptionalText(formData, "desired_model");
  const desiredCategory = asOptionalText(formData, "desired_category");

  if (!make || !model || !year || !mileage) {
    redirect("/listings/new?error=missing-required-fields");
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name:
        (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        user.email?.split("@")[0] ||
        user.phone ||
        "AutoSwap user",
      phone: user.phone ?? null,
      avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null
    },
    { onConflict: "id" }
  );

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      owner_id: user.id,
      make,
      model,
      year,
      mileage,
      fuel_type: asOptionalText(formData, "fuel_type"),
      transmission: asOptionalText(formData, "transmission"),
      location: asOptionalText(formData, "location"),
      description,
      listing_type: asText(formData, "listing_type") || "swap",
      cash_adjustment: getListingCashAdjustment(formData),
      status: "active"
    })
    .select("id")
    .single();

  if (vehicleError || !vehicle) {
    redirect("/listings/new?error=vehicle-create-failed");
  }

  if (desiredMake || desiredModel || desiredCategory) {
    await supabase.from("desired_vehicles").insert({
      vehicle_id: vehicle.id,
      desired_make: desiredMake,
      desired_model: desiredModel,
      desired_category: desiredCategory
    });
  }

  const files = formData
    .getAll("photos")
    .filter((value): value is File => typeof value === "object" && value !== null && "size" in value && Number((value as File).size) > 0)
    .slice(0, 6);

  for (const [position, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `vehicles/${vehicle.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("vehicle-photos").upload(storagePath, file, {
      contentType: file.type || "image/jpeg"
    });

    if (!uploadError) {
      const {
        data: { publicUrl }
      } = supabase.storage.from("vehicle-photos").getPublicUrl(storagePath);

      await supabase.from("vehicle_photos").insert({
        vehicle_id: vehicle.id,
        url: publicUrl,
        position
      });
    }
  }

  revalidatePath("/");
  redirect(`/vehicles/${vehicle.id}`);
}

export async function createOffer(formData: FormData) {
  const targetVehicleId = asText(formData, "target_vehicle_id");
  const toUserId = asText(formData, "to_user_id");
  const offeredVehicleId = asText(formData, "offered_vehicle_id");
  const { supabase, user } = await getAuthenticatedClient(targetVehicleId ? `/vehicles/${targetVehicleId}` : "/");

  if (!targetVehicleId || !toUserId || !offeredVehicleId) {
    redirect(targetVehicleId ? `/vehicles/${targetVehicleId}?error=offer-missing` : "/?error=offer-missing");
  }

  const { error } = await supabase.from("offers").insert({
    target_vehicle_id: targetVehicleId,
    offered_vehicle_id: offeredVehicleId,
    from_user_id: user.id,
    to_user_id: toUserId,
    cash_adjustment: getOfferCashAdjustment(formData),
    message: asOptionalText(formData, "message"),
    status: "pending"
  });

  if (error) {
    redirect(`/vehicles/${targetVehicleId}?error=offer-create-failed`);
  }

  revalidatePath("/offers");
  redirect("/offers");
}

export async function acceptOffer(formData: FormData) {
  const offerId = asText(formData, "offer_id");
  const { supabase } = await getAuthenticatedClient("/offers");

  if (!offerId) {
    redirect("/offers?error=offer-missing");
  }

  const { data, error } = await supabase.rpc("accept_offer", {
    offer_id_input: offerId
  });

  if (error || !data) {
    redirect("/offers?error=accept-failed");
  }

  revalidatePath("/offers");
  revalidatePath("/messages");
  redirect(`/messages/${data}`);
}

export async function rejectOffer(formData: FormData) {
  const offerId = asText(formData, "offer_id");
  const { supabase, user } = await getAuthenticatedClient("/offers");

  if (offerId) {
    await supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("id", offerId)
      .eq("to_user_id", user.id)
      .eq("status", "pending");
  }

  revalidatePath("/offers");
}

export async function cancelOffer(formData: FormData) {
  const offerId = asText(formData, "offer_id");
  const { supabase, user } = await getAuthenticatedClient("/offers");

  if (offerId) {
    await supabase
      .from("offers")
      .update({ status: "cancelled" })
      .eq("id", offerId)
      .eq("from_user_id", user.id)
      .eq("status", "pending");
  }

  revalidatePath("/offers");
}

export async function sendMessage(formData: FormData) {
  const conversationId = asText(formData, "conversation_id");
  const body = asText(formData, "body");
  const { supabase, user } = await getAuthenticatedClient(conversationId ? `/messages/${conversationId}` : "/messages");

  if (conversationId && body) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body
    });

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
  }
}
