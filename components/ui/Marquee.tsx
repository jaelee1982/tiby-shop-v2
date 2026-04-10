"use client";

type Props = {
  items: string[];
  speed?: number;
  className?: string;
};

export function Marquee({ items, speed = 20, className = "" }: Props) {
  const content = items.join(" · ");
  const track = `${content} · ${content} · `;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        <span className="font-jp text-xs tracking-[2px] text-cream-dim shrink-0 pr-4">
          {track}
        </span>
        <span className="font-jp text-xs tracking-[2px] text-cream-dim shrink-0 pr-4">
          {track}
        </span>
      </div>
    </div>
  );
}
