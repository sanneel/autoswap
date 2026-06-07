import Link from "next/link";
import { Send } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { sendMessage } from "@/app/actions";
import { RealtimeMessages } from "@/components/realtime-messages";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message, Offer, Vehicle } from "@/lib/types";

type ConversationDetail = Conversation & {
  offers?: Offer & {
    target_vehicle?: Vehicle | null;
    offered_vehicle?: Vehicle | null;
  };
  messages?: Message[];
};

async function getConversation(id: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, userId: null, conversation: null as ConversationDetail | null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=/messages/${id}`);
  }

  const { data } = await supabase
    .from("conversations")
    .select(
      `
        *,
        offers:offer_id(
          *,
          target_vehicle:vehicles!offers_target_vehicle_id_fkey(id, make, model, year),
          offered_vehicle:vehicles!offers_offered_vehicle_id_fkey(id, make, model, year)
        ),
        messages(id, conversation_id, sender_id, body, created_at, read_at)
      `
    )
    .eq("id", id)
    .single();

  return { supabase, userId: user.id, conversation: data as ConversationDetail | null };
}

export default async function ConversationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, userId, conversation } = await getConversation(id);

  if (!supabase) {
    return (
      <main className="page-shell simple-layout">
        <section className="wide-card">
          <p className="eyebrow">Setup required</p>
          <h1>Chat</h1>
          <div className="setup-notice">Connect Supabase before opening accepted-offer chats.</div>
        </section>
      </main>
    );
  }

  if (!conversation || !userId) {
    notFound();
  }

  const messages = [...(conversation.messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const offer = conversation.offers;

  return (
    <main className="page-shell simple-layout">
      <section className="wide-card" aria-labelledby="chat-title">
        <p className="eyebrow">Conversation</p>
        <h1 id="chat-title">
          {offer?.offered_vehicle?.make ?? "Offered car"} for {offer?.target_vehicle?.make ?? "target car"}
        </h1>
        <p className="lead">
          {offer?.offered_vehicle ? (
            <Link href={`/vehicles/${offer.offered_vehicle.id}`}>
              {offer.offered_vehicle.year} {offer.offered_vehicle.make} {offer.offered_vehicle.model}
            </Link>
          ) : (
            "Offered vehicle"
          )}{" "}
          to{" "}
          {offer?.target_vehicle ? (
            <Link href={`/vehicles/${offer.target_vehicle.id}`}>
              {offer.target_vehicle.year} {offer.target_vehicle.make} {offer.target_vehicle.model}
            </Link>
          ) : (
            "target vehicle"
          )}
        </p>

        {messages.length > 0 ? (
          <RealtimeMessages conversationId={conversation.id} currentUserId={userId} initialMessages={messages} />
        ) : (
          <div className="message-list">
            <div className="empty-state">No messages yet.</div>
            <RealtimeMessages conversationId={conversation.id} currentUserId={userId} initialMessages={[]} />
          </div>
        )}

        <form className="search-form" action={sendMessage}>
          <input type="hidden" name="conversation_id" value={conversation.id} />
          <label className="sr-only" htmlFor="body">
            Message
          </label>
          <input id="body" name="body" placeholder="Write a message" required />
          <button className="button button--primary" type="submit">
            <Send size={18} aria-hidden="true" />
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
