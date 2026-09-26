export default function WhatsAppFloat({
  phone = "+971500000000",
  message = "Hi NCR Properties, I’d like to know more about your listings.",
}) {
  const digits = String(phone).replace(/[^\d]/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={[
        "fixed z-50 right-5 bottom-5 md:right-8 md:bottom-8",
        "inline-flex items-center gap-3",
        "rounded-full px-4 py-3",
        "bg-[#25D366] text-white shadow-lg shadow-black/10",
        "hover:brightness-95 active:brightness-90 transition",
        "border border-white/20",
      ].join(" ")}
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <span className="text-xl leading-none">WhatsApp</span>
      <span className="hidden md:inline text-sm font-semibold">
        Chat with us
      </span>
    </a>
  );
}