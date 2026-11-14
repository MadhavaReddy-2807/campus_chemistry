"use client";

import { useState } from "react";
import { sendEventChatMessage } from "./event-chat-actions";

type EventMessage = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  is_mine: boolean;
};

const DEFAULT_MESSAGES: EventMessage[] = [
  {
    id: "msg-1",
    body: "Looking forward to meeting everyone! We'll gather right outside the entrance.",
    author_name: "Event Host",
    created_at: "2027-02-07T17:00:00Z",
    is_mine: false,
  },
];

export function EventChat({
  eventId,
  initialMessages = [],
}: {
  eventId: string;
  initialMessages?: EventMessage[];
}) {
  const [messages, setMessages] = useState<EventMessage[]>(
    initialMessages.length > 0 ? initialMessages : DEFAULT_MESSAGES
  );
  const [input, setInput] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: EventMessage = {
      id: `local-${Date.now()}`,
      body: input.trim(),
      author_name: "You",
      created_at: new Date().toISOString(),
      is_mine: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    const text = input;
    setInput("");

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("body", text);
    await sendEventChatMessage(null, formData);
  }

  return (
    <section className="event-chat-container">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">ATTENDEE CHAT</span>
          <h2>Meetup Coordination</h2>
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "11px", margin: "0 0 12px" }}>
        Chat is exclusively visible to confirmed attendees and the event host.
      </p>

      <div className="event-message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`event-msg-bubble ${msg.is_mine ? "mine" : "peer"}`}>
            <strong>{msg.author_name}</strong>
            <p>{msg.body}</p>
            <small>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="event-chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Coordinate arrival, ask questions, or say hi…"
          maxLength={1000}
        />
        <button className="primary-button" type="submit" disabled={!input.trim()}>
          Send <span>→</span>
        </button>
      </form>
    </section>
  );
}
