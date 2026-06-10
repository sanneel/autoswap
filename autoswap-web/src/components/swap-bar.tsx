"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";

interface SwapBarProps {
  initialWant?: string;
}

export function SwapBar({ initialWant = "" }: SwapBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const want = formData.get("want") as string;

    const params = new URLSearchParams();
    if (want) params.set("q", want);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <form className="swap-bar" onSubmit={handleSubmit}>
      <div className="swap-bar__field">
        <label htmlFor="want">მოძებნე</label>
        <input
          id="want"
          name="want"
          type="text"
          placeholder="მარკა ან მოდელი..."
          defaultValue={initialWant}
          autoComplete="off"
        />
      </div>

      <div className="swap-bar__pivot" aria-hidden="true">
        <ArrowLeftRight size={18} />
      </div>

      <button className="button button--primary swap-bar__submit" type="submit">
        ძიება
      </button>
    </form>
  );
}