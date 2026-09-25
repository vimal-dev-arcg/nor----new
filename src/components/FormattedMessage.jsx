import React from "react";

// Parses text with markdown-like bold (**text**), bullet points (• or *), and clean spacing
export function FormattedMessage({ text = "", isUser = false }) {
  if (!text) return null;

  // Split lines
  const lines = String(text).split("\n");

  return (
    <div className={`space-y-1.5 ${isUser ? "text-white" : "text-slate-800"}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          // Empty line acts as a spacer
          return <div key={lineIdx} className="h-1" />;
        }

        // Check if line is a bullet point: starts with "•", "-", or "* "
        const isBullet =
          trimmed.startsWith("•") ||
          trimmed.startsWith("- ") ||
          (trimmed.startsWith("* ") && !trimmed.startsWith("**"));

        let content = trimmed;
        if (isBullet) {
          content = trimmed.replace(/^([•\-\*]\s*)/, "");
        }

        // Check if line is a section header (e.g. starts and ends with bold, or has emojis + bold)
        const isHeaderLike =
          !isBullet &&
          (trimmed.startsWith("### ") ||
            trimmed.startsWith("## ") ||
            trimmed.startsWith("# "));

        if (isHeaderLike) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <div
              key={lineIdx}
              className="font-bold text-xs text-slate-900 pt-1 pb-0.5 border-b border-slate-100"
            >
              {renderInlineBold(headerText)}
            </div>
          );
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b3975b] mt-1.5 shrink-0" />
              <div className="flex-1 leading-relaxed text-xs">
                {renderInlineBold(content)}
              </div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed text-xs">
            {renderInlineBold(content)}
          </p>
        );
      })}
    </div>
  );
}

// Parses **bold** segments into clean <strong> tags and removes unparsed stray asterisks
function renderInlineBold(rawText) {
  if (!rawText) return null;

  // Regex splits by **...**
  const parts = rawText.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={i} className="font-bold text-slate-900">
          {boldContent}
        </strong>
      );
    }
    // Clean any accidental stray double asterisks
    const cleaned = part.replace(/\*\*/g, "");
    return <React.Fragment key={i}>{cleaned}</React.Fragment>;
  });
}
