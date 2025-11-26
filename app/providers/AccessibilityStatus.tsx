"use client";

import { useState, useEffect } from "react";

let globalSetMessage: ((msg: string) => void) | null = null;

export function announce(msg: string) {
  globalSetMessage?.(msg);
}

export default function AccessibilityStatus() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    globalSetMessage = (m: string) => {
      setMessage(m);
      setTimeout(() => setMessage(""), 1200);
    };

    return () => {
      globalSetMessage = null;
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clip: "rect(1px, 1px, 1px, 1px)",
      }}
    >
      {message}
    </div>
  );
}
