"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SwapBarProps {
  initialWant?: string;
}

export function SwapBar({ initialWant = "" }: SwapBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const want = formData.get("want") as string;
    const have = formData.get("have") as string;

    const params = new URLSearchParams();
    if (want) params.set("q", want);
    if (have) params.set("have", have);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <form className="swap-bar" onSubmit={handleSubmit}>
      <div className="swap-bar__field">
        <label htmlFor="have">მართავ</label>
        <input
          id="have"
          name="have"
          type="text"
          placeholder="Toyota"
          autoComplete="off"
        />
      </div>

      <div className="swap-bar__pivot" aria-hidden="true">
        <Search size={18} />
      </div>

      <div className="swap-bar__field">
        <label htmlFor="want">ეძებს</label>
        <input
          id="want"
          name="want"
          type="text"
          placeholder="RAV4, X5..."
          defaultValue={initialWant}
          autoComplete="off"
        />
      </div>

      <button className="button button--primary swap-bar__submit" type="submit">
        ძიება
      </button>
    </form>
  );
}