"use client";

import { useState } from "react";

type PostTextProps = {
  body: string;
};

function shouldShowToggle(body: string) {
  return body.length > 220 || body.split(/\r?\n/).length > 3;
}

export function PostText({ body }: PostTextProps) {
  const [expanded, setExpanded] = useState(false);
  const canToggle = shouldShowToggle(body);

  return (
    <div>
      <p
        className="whitespace-pre-line text-[15px] font-normal leading-[1.6] text-weldoo-ink"
        style={
          canToggle && !expanded
            ? {
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                display: "-webkit-box",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {body}
      </p>
      {canToggle ? (
        <button
          className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold tracking-[-0.01em] text-weldoo-muted transition hover:text-weldoo-indigo"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? "Show less" : "...more"}
        </button>
      ) : null}
    </div>
  );
}
