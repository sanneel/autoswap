import { CircleAlert } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <CircleAlert aria-hidden="true" size={20} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
