import Link from "next/link";
import { Gauge, MapPin, Repeat2, SendHorizontal } from "lucide-react";
import { cashAdjustmentTone, desiredSummary, formatListingCash, formatMileage } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const photo = [...(vehicle.vehicle_photos ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? fallbackImage;
  const tone = cashAdjustmentTone(vehicle.cash_adjustment);
  const cashLabel = formatListingCash(vehicle.cash_adjustment);
  const wants = desiredSummary(vehicle);
  const cashBadgeClass =
    tone === "positive"
      ? "swap-chip swap-chip--positive"
      : tone === "negative"
        ? "swap-chip swap-chip--negative"
        : "swap-chip";

  return (
    <article className="vehicle-card">
      <Link className="vehicle-card__media" href={`/vehicles/${vehicle.id}`} aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
        <img src={photo} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
        <span className={cashBadgeClass}>{cashLabel}</span>
      </Link>

      <div className="vehicle-card__body">
        <div className="vehicle-title">
          <div>
            <h3>
              <Link href={`/vehicles/${vehicle.id}`}>
                {vehicle.make} {vehicle.model}
              </Link>
            </h3>
            <span>{vehicle.year}</span>
          </div>
        </div>

        <div className="meta-row">
          <span>
            <Gauge size={15} aria-hidden="true" /> {formatMileage(vehicle.mileage)}
          </span>
          <span>
            <MapPin size={15} aria-hidden="true" /> {vehicle.location ?? "ლოკაცია ღია"}
          </span>
        </div>

        <div className="wants-row" aria-label="ეძებს">
          <span className="wants-row__label">
            <Repeat2 size={14} aria-hidden="true" /> ეძებს
          </span>
          <span className="wants-row__value">{wants}</span>
        </div>

        <Link className="button button--primary vehicle-card__cta" href={`/vehicles/${vehicle.id}#offer`}>
          <SendHorizontal size={16} aria-hidden="true" />
          შესთავაზე შენი მანქანა
        </Link>
      </div>
    </article>
  );
}
