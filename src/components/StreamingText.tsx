import { useEffect, useRef, useState, useCallback } from "react";

interface StreamingTextProps {
  stream: ReadableStream<Uint8Array> | null;
  onDone: () => void;
}

interface ParsedBlock {
  type: "h2" | "h3" | "quote" | "list" | "paragraph";
  content: string;
  items?: string[];
}

function parseMarkdown(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split("\n");
  let currentList: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", content: "", items: [...currentList] });
      currentList = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", content: trimmed.slice(3) });
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", content: trimmed.slice(4) });
    } else if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", content: trimmed.slice(2) });
    } else if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const itemContent = trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
      currentList.push(itemContent);
    } else {
      flushList();
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function StreamingText({ stream, onDone }: StreamingTextProps) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    setDone(true);
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (!stream) return;

    let cancelled = false;
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let receivedAny = false;

    const timeoutId = setTimeout(() => {
      if (!receivedAny && !cancelled) {
        setError(true);
        try { reader.cancel(); } catch { /* noop */ }
        finish();
      }
    }, 30000);

    const read = async () => {
      while (!cancelled) {
        try {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;
          receivedAny = true;
          const chunk = decoder.decode(value, { stream: true });
          setText((prev) => prev + chunk);
        } catch {
          if (!cancelled) {
            setError(true);
          }
          break;
        }
      }
      clearTimeout(timeoutId);
      if (!cancelled) {
        finish();
      }
    };

    read();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      try { reader.cancel(); } catch { /* noop */ }
    };
  }, [stream, finish]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  const blocks = parseMarkdown(text);

  return (
    <div
      ref={containerRef}
      className="max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl bg-white/60 p-5 text-sm leading-relaxed text-ink/80 md:max-h-[60vh]"
    >
      {error && text.length === 0 && (
        <p className="text-center text-coral">
          AI 响应超时或出错，请点击"重新分析"重试。
        </p>
      )}

      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="border-b border-ink/10 pb-2 font-display text-lg font-bold text-ink">
                {block.content}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="font-display text-base font-bold text-ink">
                {block.content}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="bg-coral/5 py-2 pl-3 text-xs italic text-stone"
                style={{ borderLeft: "3px solid rgba(255,107,107,0.4)" }}
              >
                {renderInline(block.content)}
              </blockquote>
            );
          case "list":
            return (
              <ul key={i} className="space-y-1.5">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-0.5 text-coral">•</span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className="text-sm">
                {renderInline(block.content)}
              </p>
            );
        }
      })}

      {!done && !error && (
        <span className="inline-block h-4 w-2 animate-pulse bg-coral" />
      )}
    </div>
  );
}
