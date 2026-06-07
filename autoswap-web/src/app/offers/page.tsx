import Link from "next/link";
import { Inbox, MessageSquare, SendHorizontal, X } from "lucide-react";
import { redirect } from "next/navigation";
import { acceptOffer, cancelOffer, rejectOffer } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { formatOfferCash } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Offer, Vehicle } from "@/lib/types";

type OfferWithConversation = Offer & {
  conversations?: Array<{ id: string }>;
};

async function getOffers() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, userId: null, offers: [] as OfferWithConversation[] };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/offers");
  }

  const { data } = await supabase
    .from("offers")
    .select(
      `
        *,
        target_vehicle:vehicles!offers_target_vehicle_id_fkey(
          id, owner_id, make, model, year, mileage, fuel_type, transmission, location, description,
          listing_type, cash_adjustment, status,
          vehicle_photos(id, url, position)
        ),
        offered_vehicle:vehicles!offers_offered_vehicle_id_fkey(
          id, owner_id, make, model, year, mileage, fuel_type, transmission, location, description,
          listing_type, cash_adjustment, status,
          vehicle_photos(id, url, position)
        ),
        conversations(id)
      `
    )
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return { supabase, userId: user.id, offers: (data ?? []) as OfferWithConversation[] };
}

function VehicleLabel({ vehicle }: { vehicle: Vehicle | null | undefined }) {
  if (!vehicle) {
    return <span>Vehicle unavailable</span>;
  }

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      {vehicle.year} {vehicle.make} {vehicle.model}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "accepted"
      ? "badge"
      : status === "pending"
        ? "badge badge--amber"
        : status === "rejected" || status === "cancelled"
          ? "badge badge--red"
          : "badge badge--blue";

  return <span className={className}>{status}</span>;
}

function OfferItem({ offer, userId }: { offer: OfferWithConversation; userId: string }) {
  const incoming = offer.to_user_id === userId;
  const conversationId = offer.conversations?.[0]?.id;

  return (
    <article className="offer-item">
      <div className="vehicle-title">
        <div>
          <p className="eyebrow">{incoming ? "Incoming" : "Sent"}</p>
          <h3>
            <VehicleLabel vehicle={offer.offered_vehicle} /> for <VehicleLabel vehicle={offer.target_vehicle} />
          </h3>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      <div className="meta-row">
        <span>{formatOfferCash(offer.cash_adjustment)}</span>
        {offer.message && <span>{offer.message}</span>}
      </div>

      <div className="offer-actions">
        {incoming && offer.status === "pending" && (
          <>
            <form action={acceptOffer}>
              <input type="hidden" name="offer_id" value={offer.id} />
              <button className="button button--primary" type="submit">
                <MessageSquare size={17} aria-hidden="true" />
                Accept
              </button>
            </form>
            <form action={rejectOffer}>
              <input type="hidden" name="offer_id" value={offer.id} />
              <button className="button button--danger" type="submit">
                <X size={17} aria-hidden="true" />
                Reject
              </button>
            </form>
          </>
        )}

        {!incoming && offer.status === "pending" && (
          <form action={cancelOffer}>
            <input type="hidden" name="offer_id" value={offer.id} />
            <button className="button button--danger" type="submit">
              <X size={17} aria-hidden="true" />
              Cancel
            </button>
          </form>
        )}

        {offer.status === "accepted" && conversationId && (
          <Link className="button" href={`/messages/${conversationId}`}>
            <MessageSquare size={17} aria-hidden="true" />
            Open chat
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function OffersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, userId, offers } = await getOffers();
  const incoming = offers.filter((offer) => offer.to_user_id === userId);
  const sent = offers.filter((offer) => offer.from_user_id === userId);

  if (!supabase || !userId) {
    return (
      <main className="page-shell simple-layout">
        <section className="wide-card">
          <p className="eyebrow">Setup required</p>
          <h1>Offers</h1>
          <div className="setup-notice">Connect Supabase before reviewing real offers.</div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell simple-layout">
      <section className="wide-card" aria-labelledby="offers-title">
        <p className="eyebrow">Offer center</p>
        <h1 id="offers-title">My offers</h1>
        {params.error && <div className="setup-notice">Offer action failed: {params.error}</div>}

        <div className="split-grid">
          <section>
            <h2>
              <Inbox size={20} aria-hidden="true" /> Incoming
            </h2>
            <div className="offer-list">
              {incoming.length > 0 ? (
                incoming.map((offer) => <OfferItem key={offer.id} offer={offer} userId={userId} />)
              ) : (
                <EmptyState title="No incoming offers" body="Offers sent to your listings will appear here." />
              )}
            </div>
          </section>

          <section>
            <h2>
              <SendHorizontal size={20} aria-hidden="true" /> Sent
            </h2>
            <div className="offer-list">
              {sent.length > 0 ? (
                sent.map((offer) => <OfferItem key={offer.id} offer={offer} userId={userId} />)
              ) : (
                <EmptyState title="No sent offers" body="Browse a listing and offer one of your cars." />
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
