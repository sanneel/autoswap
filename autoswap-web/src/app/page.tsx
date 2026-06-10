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
          ბაზრის გარეშე.
        </h1>
        <p className="lead">
          დაამატე შენი მანქანა და იპოვე ვინც შენს უნდა. ან იპოვე ის რომელიც გსურს — და შესთავაზე შენი.
        </p>

        <SwapBar initialWant={q} />

        <div className="hero__cta-row">
          <Link className="button button--primary hero__primary" href="/listings/new">
            <Plus size={17} aria-hidden="true" />
            დაამატე მანქანა
          </Link>
          <Link className="button button--ghost hero__secondary" href="#active-swaps">
            <Search size={16} aria-hidden="true" />
            ნახე განცხადებები
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
            <p className="section__eyebrow">აქტიური გაცვლები</p>
            <h2 id="active-swaps-title">ცოცხალი მფლობელები, რეალური განცხადებები</h2>
            <p className="section__sub">
              თითოეული მფლობელი უკვე გვითხრა რა ეძებს — შენ უბრალოდ უპასუხე საკუთარი მანქანით.
            </p>
          </div>
          <Link className="button section__more" href="/listings/new">
            <Plus size={16} aria-hidden="true" />
            გამოაცხადე შენი
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
            <p className="section__eyebrow">როგორ მუშაობს</p>
            <h2 id="how-it-works-title">მარტივი პროცესი</h2>
          </div>
        </header>
        <ol className="steps">
          <li className="step">
            <span className="step__num">1</span>
            <div>
              <h3>დაამატე შენი მანქანა</h3>
              <p>შეიყვანე დეტალები და მიუთითე რა გსურს სანაცვლოდ.</p>
            </div>
          </li>
          <li className="step">
            <span className="step__num">2</span>
            <div>
              <h3>მოძებნე და შესთავაზე</h3>
              <p>იპოვე სასურველი მანქანა, გაგზავნე შეთავაზება შენი ავტოთი.</p>
            </div>
          </li>
          <li className="step">
            <span className="step__num">3</span>
            <div>
              <h3>მიწე და გაცვალე</h3>
              <p>მფლობელი რომ დაეთანხმოს, ჩატი გაიხსნება.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="section reasons" aria-labelledby="why-title">
        <header className="section__head section__head--compact">
          <div>
            <p className="section__eyebrow">რატომ AutoSwap</p>
            <h2 id="why-title">პირდაპირი კონტაქტი, დადასტურებული შეთავაზებით</h2>
          </div>
        </header>
        <div className="reasons__grid">
          <article className="reason">
            <ShieldCheck aria-hidden="true" size={22} />
            <h3>ჩატი მხოლოდ დადასტურების შემდეგ</h3>
            <p>ორი მფლობელი რომ შეთანხმდეს, მხოლოდ მაშინ იწყება კომუნიკაცია.</p>
          </article>
          <article className="reason">
            <Handshake aria-hidden="true" size={22} />
            <h3>თანხის სხვაობა გამჭვირვალეა</h3>
            <p>ყველა განცხადებაში ჩანს თუ რამდენი უნდა დაემატოს.</p>
          </article>
          <article className="reason">
            <CheckCircle2 aria-hidden="true" size={22} />
            <h3>რეალური მონაცემები</h3>
            <p>ყველა განცხადება Supabase-დან მოდის — ცოცხალი ინფორმაცია, არა სტატიკური გვერდი.</p>
          </article>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <div>
          <p className="section__eyebrow">დაიწყე ახლავე</p>
          <h2 id="cta-title">დაიწყე გაცვლა</h2>
          <p>დაამატე შენი მანქანა და იპოვე ვინც შენს უნდა.</p>
        </div>
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
