"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Message } from "@/lib/types";

export function RealtimeMessages({
  conversationId,
  currentUserId,
  initialMessages
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let channel: RealtimeChannel | null = null;

    if (!supabase) {
      return;
    }

    channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const nextMessage = payload.new as Message;
          setMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return [...current, nextMessage];
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  return (
    <div className="message-list" aria-live="polite">
      {sortedMessages.map((message) => (
        <article className={`message ${message.sender_id === currentUserId ? "message--mine" : ""}`} key={message.id}>
          <p>{message.body}</p>
          <time dateTime={message.created_at}>
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }).format(new Date(message.created_at))}
          </time>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  );
}
