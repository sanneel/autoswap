import Link from "next/link";
import { CheckCircle2, Handshake, Plus, Repeat2, Search, ShieldCheck } from "lucide-react";
import { SwapBar } from "@/components/swap-bar";
import { VehicleCard } from "@/components/vehicle-card";
import { demoVehicles } from "@/lib/demo-data";
import type { Vehicle } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

async function getFeedVehicles(query: string) {
  const supabase = await createClient();

  if (!supabase) {
    const filtered = filterDemoVehicles(query);
    return { vehicles: filtered, isDemo: true, hasError: false };
  }

  let request = supabase
    .from("vehicles")
    .select(
      `
        *,
        profiles:owner_id(id, display_name, phone, avatar_url),
        vehicle_photos(id, url, position),
        desired_vehicles(id, desired_make, desired_model, desired_category)
      `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (query) {
    const safeQuery = query.replaceAll(",", " ");
    request = request.or(`make.ilike.%${safeQuery}%,model.ilike.%${safeQuery}%,location.ilike.%${safeQuery}%`);
  }

  const { data, error } = await request;

  if (error) {
    return { vehicles: filterDemoVehicles(query), isDemo: true, hasError: true };
  }

  return { vehicles: (data ?? []) as Vehicle[], isDemo: false, hasError: false };
}

function filterDemoVehicles(query: string) {
  if (!query) {
    return demoVehicles;
  }

  const normalized = query.toLowerCase();

  return demoVehicles.filter((vehicle) =>
    [vehicle.make, vehicle.model, vehicle.location, vehicle.fuel_type, vehicle.transmission]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const { vehicles, isDemo, hasError } = await getFeedVehicles(q);
  const activeCount = vehicles.length;

  return (
    <main className="page-shell landing">
      <section className="hero" aria-labelledby="page-title">
        <h1 id="page-title">
          <span className="hero__accent">გაცვლა.</span>
          <br />
          არა გაყიდვა.
        </h1>
        <p className="lead">
          იპოვე ვინც შენს მანქანას ეძებს. ან იპოვე რა გსურს — და შესთავაზე შენი.
        </p>

        <SwapBar initialWant={q} />

        <div className="hero__cta-row">
          <Link className="button button--primary hero__primary" href="/listings/new">
            <Plus size={17} aria-hidden="true" />
            დაამატე მანქანა
          </Link>
        </div>
      </section>

      {(isDemo || hasError) && (
        <div className="setup-notice">
          {hasError
            ? "Supabase-მა დააბრუნა შეცდომა — დროებით ნაჩვენებია სადემონსტრაციო განცხადებები."
            : "სანამ NEXT_PUBLIC_SUPABASE_URL და NEXT_PUBLIC_SUPABASE_ANON_KEY არ არის გაწერილი, ნაჩვენებია სადემონსტრაციო განცხადებები."}
        </div>
      )}

      <section className="section" id="active-swaps" aria-labelledby="active-swaps-title">
        <header className="section__head">
          <div>
            <h2 id="active-swaps-title">განცხადებები</h2>
            <p className="section__sub">
              {activeCount} აქტიური განცხადება
            </p>
          </div>
          <Link className="button" href="/listings/new">
            <Plus size={16} aria-hidden="true" />
            ახალი
          </Link>
        </header>

        {vehicles.length > 0 ? (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            ვერ ვიპოვეთ შესაბამისი განცხადებები. სცადე სხვა მარკა ან მოდელი.
          </div>
        )}
      </section>

      <section className="section how-it-works" aria-labelledby="how-it-works-title">
        <header className="section__head section__head--compact">
          <div>
            <h2 id="how-it-works-title">როგორ მუშაობს</h2>
          </div>
        </header>
        <div className="steps">
          <div className="step">
            <h3>დაამატე მანქანა</h3>
            <p>შეიყვანე მარკა, მოდელი, წელი. მიუთითე რა გსურს სანაცვლოდ.</p>
          </div>
          <div className="step">
            <h3>მოძებნე და შესთავაზე</h3>
            <p>იპოვე განცხადება რომელიც გინდა. გაგზავნე შეთავაზება შენი ავტოთი.</p>
          </div>
          <div className="step">
            <h3>მფლობელი რომ დაეთანხმოს</h3>
            <p>ჩატი გაიხსნება. შეთანხმდით და გაცვალეთ.</p>
          </div>
        </div>
      </section>

      <section className="section reasons" aria-labelledby="why-title">
        <header className="section__head section__head--compact">
          <div>
            <h2 id="why-title">რატომ AutoSwap</h2>
          </div>
        </header>
        <div className="reasons__grid">
          <article className="reason">
            <ShieldCheck aria-hidden="true" size={22} />
            <h3>კონტაქტი მხოლოდ შეთანხმების შემდეგ</h3>
            <p>ჩატი იხსნება მხოლოდ მაშინ, როცა ორივე მხარე დაეთანხმა.</p>
          </article>
          <article className="reason">
            <Handshake aria-hidden="true" size={22} />
            <h3>თანხის სხვაობა ღიაა</h3>
            <p>განცხადებაში ჩანს თუ რამდენი უნდა დაემატოს.</p>
          </article>
          <article className="reason">
            <CheckCircle2 aria-hidden="true" size={22} />
            <h3>რეალური მონაცემები</h3>
            <p>ყველა განცხადება ბაზიდან მოდის — არა სტატიკური გვერდი.</p>
          </article>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <h2 id="cta-title">დაიწყე გაცვლა</h2>
        <p>დაამატე შენი მანქანა და იპოვე ვინც შენს უნდა.</p>
        <div className="final-cta__actions">
          <Link className="button button--primary" href="/listings/new">
            <Plus size={17} aria-hidden="true" />
            დაამატე მანქანა
          </Link>
        </div>
      </section>
    </main>
  );
}
