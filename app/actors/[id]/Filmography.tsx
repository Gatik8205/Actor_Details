"use client";

import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
//import { MovieCredit } from "@/app/lib/getActorCredits";
import { useQuery, useQueryClient } from "@tanstack/react-query";


interface Props {
  credits: MovieCredit[];
}

export default function Filmography({ credits }: Props) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: credits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: "600px",
        overflowY: "auto",
        background: "#000",
        padding: "10px",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const credit = credits[virtualRow.index];

          return (
            <div
              key={credit.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translateY(${virtualRow.start}px)`,
                width: "100%",
                display: "flex",
                gap: "15px",
                padding: "10px",
                background: "#111",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              {credit.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${credit.poster_path}`}
                  alt={credit.title}
                  width={60}
                  height={90}
                />
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>{credit.title}</h3>
                <p style={{ margin: 0, opacity: 0.7 }}>
                  {credit.character || "Unknown role"}
                </p>
                <p style={{ margin: 0, opacity: 0.5 }}>
                  {credit.release_date || "Unknown"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
