"use client";
import React from "react";

type Props = { text: string };

// Minimal, dependency-free Markdown renderer focusing on bold, italics and inline code.
// Supported:
// - **bold**
// - *italic* or _italic_
// - `inline code`
// - preserves line breaks and paragraphs
// - fenced code blocks ``` ... ```
// - simple lists (-, *, 1.)
// - simple GitHub-style tables
export default function MarkdownLite({ text }: Props) {
  if (!text) return null;

  const blocks = splitFencedCodeBlocks(text);

  return (
    <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <pre
            key={i}
            className="my-2 rounded bg-black/40 border border-white/10 p-2 overflow-x-auto text-xs"
          >
            <code>{b.content}</code>
          </pre>
        ) : (
          <BlockRenderer key={i} text={b.content} />
        )
      )}
    </div>
  );
}

function splitFencedCodeBlocks(input: string): Array<{ type: "text" | "code"; content: string }> {
  const parts: Array<{ type: "text" | "code"; content: string }> = [];
  const regex = /```[\w-]*\n([\s\S]*?)\n```/g; // ```lang?\n...\n```
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(input)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", content: input.slice(lastIndex, m.index) });
    }
    parts.push({ type: "code", content: m[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    parts.push({ type: "text", content: input.slice(lastIndex) });
  }
  return parts;
}

// Renders a text block with support for paragraphs, simple lists, and tables.
function BlockRenderer({ text }: { text: string }) {
  // Normalize newlines
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Table detection: header | --- | --- | followed by rows starting with |
    if (isTableHeader(lines, i)) {
      const { element, nextIndex } = parseTable(lines, i);
      nodes.push(
        <div key={`tbl-${i}`} className="my-2 overflow-x-auto">
          {element}
        </div>
      );
      i = nextIndex;
      continue;
    }

    // List detection: -, *, or numbered like 1.
    if (isListLine(line)) {
      const { element, nextIndex } = parseList(lines, i);
      nodes.push(
        <div key={`list-${i}`} className="my-1">
          {element}
        </div>
      );
      i = nextIndex;
      continue;
    }

    // Blank line -> paragraph break
    if (!line.trim()) {
      nodes.push(<br key={`br-${i}`} />);
      i++;
      continue;
    }

    // Regular paragraph line(s) until next blank/table/list
    const start = i;
    let buf: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim() || isTableHeader(lines, i) || isListLine(l)) break;
      buf.push(l);
      i++;
    }
    nodes.push(
      <p key={`p-${start}`} className="whitespace-pre-wrap my-1">
        {renderInline(buf.join("\n"))}
      </p>
    );
  }

  return <>{nodes}</>;
}

function isTableHeader(lines: string[], idx: number): boolean {
  const header = lines[idx] || "";
  const sep = lines[idx + 1] || "";
  // Require at least two pipes and a separator line like |---|---|
  if (!/\|/.test(header) || !/\|/.test(sep)) return false;
  const looksLikeSep = /^\s*\|?\s*(-+:?\s*\|\s*)*-+:?\s*\|?\s*$/.test(sep);
  return looksLikeSep;
}

function parseTable(lines: string[], idx: number): { element: React.ReactElement; nextIndex: number } {
  const headerLine = lines[idx] || "";
  // skip separator line
  let i = idx + 2;
  const rows: string[] = [];
  while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") {
    rows.push(lines[i]);
    i++;
  }

  const headers = splitRow(headerLine);
  const body = rows.map(splitRow);

  const element = (
    <table className="text-xs min-w-max border-separate border-spacing-0">
      <thead>
        <tr>
          {headers.map((h, hi) => (
            <th
              key={hi}
              className="text-left font-semibold bg-white/5 border border-white/10 px-2 py-1"
            >
              {renderInline(h)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((r, ri) => (
          <tr key={ri}>
            {r.map((c, ci) => (
              <td key={ci} className="align-top border border-white/10 px-2 py-1">
                {renderInline(c)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return { element, nextIndex: i };
}

function splitRow(line: string): string[] {
  // Trim outer pipes, then split; keep empty cells
  const core = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return core.split("|").map((s) => s.trim());
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-*]\s+|\d+\.\s+)/.test(line);
}

function parseList(lines: string[], idx: number): { element: React.ReactElement; nextIndex: number } {
  const items: { marker: "ul" | "ol"; text: string }[] = [];
  let i = idx;
  let mode: "ul" | "ol" | null = null;
  while (i < lines.length) {
    const line = lines[i];
    if (!isListLine(line)) break;
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    const ul = /^\s*(?:[-*])\s+(.*)$/.exec(line);
    if (ol) {
      if (mode && mode !== "ol") break; // stop when list type changes
      mode = "ol";
      items.push({ marker: "ol", text: ol[1] });
    } else if (ul) {
      if (mode && mode !== "ul") break;
      mode = "ul";
      items.push({ marker: "ul", text: ul[1] });
    } else {
      break;
    }
    i++;
  }

  const element = mode === "ol" ? (
    <ol className="list-decimal list-inside space-y-1">
      {items.map((it, idx2) => (
        <li key={idx2} className="whitespace-pre-wrap">
          {renderInline(it.text)}
        </li>
      ))}
    </ol>
  ) : (
    <ul className="list-disc list-inside space-y-1">
      {items.map((it, idx2) => (
        <li key={idx2} className="whitespace-pre-wrap">
          {renderInline(it.text)}
        </li>
      ))}
    </ul>
  );

  return { element, nextIndex: i };
}

function renderInline(input: string): React.ReactNode[] {
  // First split by inline code `...`
  const segments = input.split(/(`[^`]+`)/g);
  const out: React.ReactNode[] = [];
  segments.forEach((seg, idx) => {
    if (/^`[^`]+`$/.test(seg)) {
      const content = seg.slice(1, -1);
      out.push(
        <code key={idx} className="rounded bg-black/40 px-1 py-0.5 border border-white/10 text-[0.85em]">
          {content}
        </code>
      );
    } else {
      // Bold then italics on the remaining text. Keep it simple and safe.
      // Replace **bold**
      const withBold = splitAndWrap(seg, /\*\*([^*]+)\*\*/g, (m, i) => (
        <strong key={`b-${idx}-${i}`} className="font-semibold text-zinc-100">{m}</strong>
      ));
      // For each piece, also apply _italic_ or *italic*
      const withItalics: React.ReactNode[] = [];
      withBold.forEach((piece, i) => {
        if (typeof piece !== "string") { withItalics.push(piece); return; }
        const italics = splitAndWrap(piece, /(?:\*([^*]+)\*|_([^_]+)_)/g, (m2, ii) => (
          <em key={`i-${idx}-${i}-${ii}`} className="italic text-zinc-100/90">{m2}</em>
        ));
        // After italics, highlight standalone word FREE in emerald
        italics.forEach((part, j) => {
          if (typeof part !== 'string') { withItalics.push(part); return; }
          const chunks = part.split(/(\bFREE\b)/gi);
          chunks.forEach((ch, k) => {
            if (/^\bFREE\b$/i.test(ch)) {
              withItalics.push(<span key={`free-${idx}-${i}-${j}-${k}`} className="text-emerald-300 font-semibold">FREE</span>);
            } else if (ch) {
              withItalics.push(<React.Fragment key={`t-${idx}-${i}-${j}-${k}`}>{ch}</React.Fragment>);
            }
          });
        });
      });
      out.push(<React.Fragment key={`t-${idx}`}>{withItalics}</React.Fragment>);
    }
  });
  return out;
}

function splitAndWrap(
  input: string,
  regex: RegExp,
  wrap: (matchText: string, idx: number) => React.ReactNode
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = re.exec(input)) !== null) {
    if (m.index > lastIndex) result.push(input.slice(lastIndex, m.index));
    const captured = m[1] || m[2] || "";
    result.push(wrap(captured, i++));
    lastIndex = re.lastIndex;
  }
  if (lastIndex < input.length) result.push(input.slice(lastIndex));
  return result;
}
