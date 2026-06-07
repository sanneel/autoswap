import Link from "next/link";
import { CarFront, Gauge, MapPin, Repeat2, SendHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { createOffer } from "@/app/actions";
import { demoVehicles } from "@/lib/demo-data";
import { desiredSummary, formatListingCash, formatMileage } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85";

async function getVehicle(id: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { vehicle: demoVehicles.find((item) => item.id === id) ?? null, supabase: null, user: null, myVehicles: [] as Vehicle[] };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
        *,
        profiles:owner_id(id, display_name, phone, avatar_url),
        vehicle_photos(id, url, position),
        desired_vehicles(id, desired_make, desired_model, desired_category)
      `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return { vehicle: demoVehicles.find((item) => item.id === id) ?? null, supabase, user, myVehicles: [] as Vehicle[] };
  }

  let myVehicles: Vehicle[] = [];

  if (user) {
    const { data: mine } = await supabase
      .from("vehicles")
      .select("id, owner_id, make, model, year, mileage, fuel_type, transmission, location, description, listing_type, cash_adjustment, status")
      .eq("owner_id", user.id)
      .eq("status", "active")
      .neq("id", id)
      .order("created_at", { ascending: false });

    myVehicles = (mine ?? []) as Vehicle[];
  }

  return { vehicle: data as Vehicle, supabase, user, myVehicles };
}

export default async function VehicleDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { vehicle, supabase, user, myVehicles } = await getVehicle(id);

  if (!vehicle) {
    notFound();
  }

  const photos = [...(vehicle.vehicle_photos ?? [])].sort((a, b) => a.position - b.position);
  const mainPhoto = photos[0]?.url ?? fallbackImage;
  const isOwner = user?.id === vehicle.owner_id;

  return (
    <main className="page-shell detail-layout">
      <section aria-labelledby="vehicle-title">
        <div className="gallery-main">
          <img src={mainPhoto} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
        </div>
        {photos.length > 1 && (
          <div className="thumb-row">
            {photos.slice(1, 6).map((photo) => (
              <img key={photo.url} src={photo.url} alt={`${vehicle.make} ${vehicle.model} photo ${photo.position + 1}`} />
            ))}
          </div>
        )}

        <div className="section-head">
          <div>
            <p className="eyebrow">{vehicle.status}</p>
            <h1 id="vehicle-title">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="lead">{formatListingCash(vehicle.cash_adjustment)}</p>
          </div>
        </div>

        <div className="spec-grid" aria-label="Vehicle details">
          <div className="spec">
            <span>Mileage</span>
            <strong>
              <Gauge size={16} aria-hidden="true" /> {formatMileage(vehicle.mileage)}
            </strong>
          </div>
          <div className="spec">
            <span>Location</span>
            <strong>
              <MapPin size={16} aria-hidden="true" /> {vehicle.location ?? "Open"}
            </strong>
          </div>
          <div className="spec">
            <span>Fuel</span>
            <strong>{vehicle.fuel_type ?? "Open"}</strong>
          </div>
          <div className="spec">
            <span>Transmission</span>
            <strong>{vehicle.transmission ?? "Open"}</strong>
          </div>
        </div>

        <p className="detail-copy">
          {vehicle.description ?? "The owner has not added a detailed description yet."}
        </p>
      </section>

      <aside>
        {query.error && <div className="setup-notice">Offer could not be sent: {query.error}</div>}

        <section className="panel">
          <h2>Owner wants</h2>
          <div className="desired-row">
            <Repeat2 size={18} aria-hidden="true" />
            {desiredSummary(vehicle)}
          </div>
          <p className="muted">Listed by {vehicle.profiles?.display_name ?? "AutoSwap member"}</p>
        </section>

        <section className="panel">
          <h2>Offer your car</h2>
          {!supabase && (
            <div className="setup-notice">Connect Supabase before sending real offers. This detail page is in demo mode.</div>
          )}
          {supabase && !user && (
            <Link className="button button--primary" href={`/auth?next=/vehicles/${vehicle.id}`}>
              <SendHorizontal size={18} aria-hidden="true" />
              Sign in to offer
            </Link>
          )}
          {supabase && user && isOwner && <div className="setup-notice">This is your listing.</div>}
          {supabase && user && !isOwner && myVehicles.length === 0 && (
            <div className="auth-options">
              <div className="setup-notice">Add one of your cars before making an offer.</div>
              <Link className="button button--primary" href="/listings/new">
                <CarFront size={18} aria-hidden="true" />
                Add your car
              </Link>
            </div>
          )}
          {supabase && user && !isOwner && myVehicles.length > 0 && (
            <form className="auth-options" action={createOffer}>
              <input type="hidden" name="target_vehicle_id" value={vehicle.id} />
              <input type="hidden" name="to_user_id" value={vehicle.owner_id} />
              <div className="field">
                <label htmlFor="offered_vehicle_id">Your car</label>
                <select id="offered_vehicle_id" name="offered_vehicle_id" required>
                  {myVehicles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.year} {item.make} {item.model}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="field">
                <legend className="legend">Money adjustment</legend>
                <div className="radio-grid">
                  <label className="radio-card">
                    <input type="radio" name="cash_direction" value="straight" defaultChecked />
                    Straight
                  </label>
                  <label className="radio-card">
                    <input type="radio" name="cash_direction" value="sender_adds" />
                    I add
                  </label>
                  <label className="radio-card">
                    <input type="radio" name="cash_direction" value="sender_wants" />
                    I want
                  </label>
                </div>
              </fieldset>

              <div className="field">
                <label htmlFor="cash_amount">Cash amount</label>
                <input id="cash_amount" name="cash_amount" type="number" min="0" placeholder="2000" />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Short note for the owner" />
              </div>
              <button className="button button--primary" type="submit">
                <SendHorizontal size={18} aria-hidden="true" />
                Send offer
              </button>
            </form>
          )}
        </section>
      </aside>
    </main>
  );
}
