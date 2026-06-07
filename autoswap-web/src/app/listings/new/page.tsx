import { Camera, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createVehicle } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function NewListingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="page-shell simple-layout">
        <section className="wide-card">
          <p className="eyebrow">Setup required</p>
          <h1>Add listing</h1>
          <div className="setup-notice">Set Supabase environment variables before creating real listings.</div>
        </section>
      </main>
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/listings/new");
  }

  return (
    <main className="page-shell simple-layout">
      <section className="wide-card" aria-labelledby="new-listing-title">
        <p className="eyebrow">Vehicle listing</p>
        <h1 id="new-listing-title">Add your car</h1>
        {params.error && <div className="setup-notice">Listing could not be saved: {params.error}</div>}

        <form className="form-grid" action={createVehicle}>
          <div className="field">
            <label htmlFor="make">Make</label>
            <input id="make" name="make" required placeholder="Audi" />
          </div>
          <div className="field">
            <label htmlFor="model">Model</label>
            <input id="model" name="model" required placeholder="A6" />
          </div>
          <div className="field">
            <label htmlFor="year">Year</label>
            <input id="year" name="year" type="number" min="1900" max="2100" required />
          </div>
          <div className="field">
            <label htmlFor="mileage">Mileage</label>
            <input id="mileage" name="mileage" type="number" min="0" required />
          </div>
          <div className="field">
            <label htmlFor="fuel_type">Fuel</label>
            <select id="fuel_type" name="fuel_type" defaultValue="">
              <option value="">Open</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="lpg">LPG</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="transmission">Transmission</label>
            <select id="transmission" name="transmission" defaultValue="">
              <option value="">Open</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
              <option value="semi_automatic">Semi automatic</option>
              <option value="cvt">CVT</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" placeholder="Tbilisi" />
          </div>
          <div className="field">
            <label htmlFor="listing_type">Listing type</label>
            <select id="listing_type" name="listing_type" defaultValue="swap">
              <option value="swap">Swap</option>
              <option value="sell">Sell</option>
              <option value="sell_or_swap">Sell or swap</option>
            </select>
          </div>

          <fieldset className="field field--full">
            <legend className="legend">Money preference</legend>
            <div className="radio-grid">
              <label className="radio-card">
                <input type="radio" name="cash_direction" value="straight" defaultChecked />
                Straight swap
              </label>
              <label className="radio-card">
                <input type="radio" name="cash_direction" value="owner_wants" />
                I want money
              </label>
              <label className="radio-card">
                <input type="radio" name="cash_direction" value="owner_adds" />
                I add money
              </label>
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="cash_amount">Cash amount</label>
            <input id="cash_amount" name="cash_amount" type="number" min="0" placeholder="2000" />
          </div>
          <div className="field">
            <label htmlFor="desired_category">Desired category</label>
            <input id="desired_category" name="desired_category" placeholder="SUV, Electric, Sedan" />
          </div>
          <div className="field">
            <label htmlFor="desired_make">Desired make</label>
            <input id="desired_make" name="desired_make" placeholder="BMW" />
          </div>
          <div className="field">
            <label htmlFor="desired_model">Desired model</label>
            <input id="desired_model" name="desired_model" placeholder="X5" />
          </div>
          <div className="field field--full">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" placeholder="Condition, service history, swap notes" />
          </div>
          <div className="field field--full">
            <label htmlFor="photos">Photos</label>
            <input id="photos" name="photos" type="file" accept="image/*" multiple />
          </div>
          <div className="field--full offer-actions">
            <button className="button button--primary" type="submit">
              <Plus size={18} aria-hidden="true" />
              Publish listing
            </button>
            <span className="badge badge--blue">
              <Camera size={15} aria-hidden="true" />
              Up to 6 photos
            </span>
          </div>
        </form>
      </section>
    </main>
  );
}
