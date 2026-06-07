import { Apple, Globe2, Smartphone } from "lucide-react";
import { sendPhoneOtp, signInWithOAuth, verifyPhoneOtp } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; phone?: string; sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";
  const phone = params.phone ?? "";
  const supabase = await createClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="page-shell auth-layout">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">Supabase Auth</p>
        <h1 id="auth-title">Sign in to AutoSwap</h1>
        <p className="lead">Create listings, send offers, and chat after an owner accepts your swap proposal.</p>

        {!supabase && (
          <div className="setup-notice">
            Supabase environment variables are missing. Add them from `.env.example` before testing auth.
          </div>
        )}

        {params.error && <div className="setup-notice">Auth could not complete: {params.error}</div>}

        {user ? (
          <div className="setup-notice">You are signed in and can continue to the marketplace.</div>
        ) : (
          <div className="split-grid">
            <div className="auth-options">
              <form action={signInWithOAuth}>
                <input type="hidden" name="provider" value="google" />
                <input type="hidden" name="next" value={next} />
                <button className="button button--primary" type="submit">
                  <Globe2 size={18} aria-hidden="true" />
                  Continue with Google
                </button>
              </form>

              <form action={signInWithOAuth}>
                <input type="hidden" name="provider" value="apple" />
                <input type="hidden" name="next" value={next} />
                <button className="button" type="submit">
                  <Apple size={18} aria-hidden="true" />
                  Continue with Apple
                </button>
              </form>
            </div>

            <div className="panel">
              <h2>Phone</h2>
              <form className="auth-options" action={sendPhoneOtp}>
                <input type="hidden" name="next" value={next} />
                <div className="field">
                  <label htmlFor="phone">Phone number</label>
                  <input id="phone" name="phone" type="tel" placeholder="+995..." defaultValue={phone} required />
                </div>
                <button className="button" type="submit">
                  <Smartphone size={18} aria-hidden="true" />
                  Send code
                </button>
              </form>

              {params.sent && (
                <form className="auth-options" action={verifyPhoneOtp}>
                  <input type="hidden" name="next" value={next} />
                  <input type="hidden" name="phone" value={phone} />
                  <div className="field">
                    <label htmlFor="token">Verification code</label>
                    <input id="token" name="token" inputMode="numeric" required />
                  </div>
                  <button className="button button--primary" type="submit">
                    Verify phone
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
