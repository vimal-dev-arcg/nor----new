export async function chat({ message, history }) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || `AI request failed (${res.status})`);
  }

  return res.json();
}

