export function formatMileage(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Mileage unknown";
  }

  return `${new Intl.NumberFormat("en").format(value)} km`;
}

export function formatMoney(value: number | null | undefined) {
  const amount = Math.abs(value ?? 0);

  return `₾${new Intl.NumberFormat("en").format(amount)}`;
}

export function formatListingCash(value: number | null | undefined) {
  const amount = value ?? 0;

  if (amount > 0) {
    return `+ ${formatMoney(amount)}`;
  }

  if (amount < 0) {
    return `− ${formatMoney(amount)}`;
  }

  return "თანხის გარეშე";
}

export function cashAdjustmentTone(value: number | null | undefined): "neutral" | "positive" | "negative" {
  const amount = value ?? 0;

  if (amount > 0) return "positive";
  if (amount < 0) return "negative";
  return "neutral";
}

export function formatOfferCash(value: number | null | undefined) {
  const amount = value ?? 0;

  if (amount > 0) {
    return `Sender adds ${formatMoney(amount)}`;
  }

  if (amount < 0) {
    return `Sender wants ${formatMoney(amount)}`;
  }

  return "Straight swap";
}

export function compactDate(value: string | undefined) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function desiredSummary(vehicle: {
  desired_vehicles?: Array<{
    desired_make: string | null;
    desired_model: string | null;
    desired_category: string | null;
  }>;
}) {
  const desire = vehicle.desired_vehicles?.[0];

  if (!desire) {
    return "ღია ნებისმიერ შეთავაზებაზე";
  }

  const label = [desire.desired_make, desire.desired_model].filter(Boolean).join(" ");

  return label || desire.desired_category || "ღია ნებისმიერ შეთავაზებაზე";
}
