import Link from "next/link";
import { CarFront, LogIn, MessageSquare, Plus, Repeat2, SendHorizontal } from "lucide-react";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <span className="brand__mark" aria-hidden="true">
            <Repeat2 size={20} />
          </span>
          <span>AutoSwap</span>
        </Link>

        <nav className="top-nav" aria-label="Main">
          <Link className="nav-link" href="/">
            <CarFront size={17} aria-hidden="true" />
            Feed
          </Link>
          <Link className="nav-link" href="/offers">
            <SendHorizontal size={17} aria-hidden="true" />
            Offers
          </Link>
          <Link className="nav-link" href="/messages">
            <MessageSquare size={17} aria-hidden="true" />
            Messages
          </Link>
        </nav>

        <div className="header-actions">
          <Link className="button button--primary" href="/listings/new">
            <Plus size={17} aria-hidden="true" />
            List car
          </Link>
          {user ? (
            <form action={signOut}>
              <button className="button button--ghost" type="submit">
                Sign out
              </button>
            </form>
          ) : (
            <Link className="button" href="/auth">
              <LogIn size={17} aria-hidden="true" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
