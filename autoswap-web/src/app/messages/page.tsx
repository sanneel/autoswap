import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { compactDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message, Offer, Vehicle } from "@/lib/types";

type ConversationWithOffer = Conversation & {
  offers?: Offer & {
    target_vehicle?: Vehicle | null;
    offered_vehicle?: Vehicle | null;
  };
  messages?: Message[];
};

async function getConversations() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, conversations: [] as ConversationWithOffer[] };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/messages");
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
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return { supabase, conversations: (data ?? []) as ConversationWithOffer[] };
}

function lastMessage(messages: Message[] | undefined) {
  return [...(messages ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
}

export default async function MessagesPage() {
  const { supabase, conversations } = await getConversations();

  if (!supabase) {
    return (
      <main className="page-shell simple-layout">
        <section className="wide-card">
          <p className="eyebrow">Setup required</p>
          <h1>Messages</h1>
          <div className="setup-notice">Connect Supabase before opening accepted-offer chats.</div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell simple-layout">
      <section className="wide-card" aria-labelledby="messages-title">
        <p className="eyebrow">Accepted offers</p>
        <h1 id="messages-title">Messages</h1>

        <div className="conversation-list">
          {conversations.length > 0 ? (
            conversations.map((conversation) => {
              const latest = lastMessage(conversation.messages);
              const offer = conversation.offers;

              return (
                <Link className="conversation-item" href={`/messages/${conversation.id}`} key={conversation.id}>
                  <div className="vehicle-title">
                    <div>
                      <h3>
                        {offer?.offered_vehicle?.make ?? "Offered car"} for {offer?.target_vehicle?.make ?? "target car"}
                      </h3>
                      <p className="muted">
                        {offer?.offered_vehicle?.model ?? ""} to {offer?.target_vehicle?.model ?? ""}
                      </p>
                    </div>
                    <span className="badge">
                      <MessageSquare size={15} aria-hidden="true" />
                      Chat
                    </span>
                  </div>
                  <p className="muted">{latest ? latest.body : "No messages yet"}</p>
                  {latest && <time dateTime={latest.created_at}>{compactDate(latest.created_at)}</time>}
                </Link>
              );
            })
          ) : (
            <EmptyState title="No conversations" body="Accept an incoming offer to create a chat." />
          )}
        </div>
      </section>
    </main>
  );
}
