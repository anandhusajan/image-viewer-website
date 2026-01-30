"use client";

import { useEffect, useState } from "react";

const LOADING_DURATION_MS = 2200;
const FADE_OUT_MS = 400;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setPhase("fading");
    }, LOADING_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const goneTimer = setTimeout(() => setPhase("gone"), FADE_OUT_MS);
    return () => clearTimeout(goneTimer);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1e3a8a] transition-opacity duration-300 ease-out"
      style={{ opacity: phase === "visible" ? 1 : 0 }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="ice-cream-loader">
        <div className="scoops">
          <div className="scoop scoop-bottom" />
          <div className="scoop scoop-middle" />
          <div className="scoop scoop-top" />
        </div>
        <div className="cone" />
      </div>
    </div>
  );
}
