"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const MENU_IMAGES = ["01", "02", "03", "04", "05", "06"] as const;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function getTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

export default function MenuGallery() {
  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 bg-gray-50 flex-1 min-h-0 w-full max-w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-3 sm:mb-6 text-center">
        Menu
      </h2>
      <div className="max-w-lg md:max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
        {MENU_IMAGES.map((num, index) => (
          <MenuImage key={num} num={num} index={index} />
        ))}
      </div>
    </section>
  );
}

function MenuImage({ num, index }: { num: string; index: number }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);
  const resetAndClose = useCallback(() => {
    setZoom(1);
    setOpen(false);
  }, []);

  const setZoomClamped = useCallback((value: number) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)));
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      else setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetAndClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, resetAndClose]);

  const zoomAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !zoomAreaRef.current) return;
    const el = zoomAreaRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        pinchRef.current = { distance, zoom: zoomRef.current };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const ratio = distance / pinchRef.current.distance;
        const newZoom = pinchRef.current.zoom * ratio;
        setZoomClamped(newZoom);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [open, setZoomClamped]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full rounded-xl overflow-hidden bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:ring-offset-2 active:opacity-90 block text-left"
        aria-label={`Open menu item ${index + 1} full screen`}
      >
        <div className="relative w-full aspect-[4/3] min-h-[160px] max-h-[72vmin] sm:max-h-[65vh]">
          <Image
            src={`/img/${num}.jpeg`}
            alt={`Miguelito's menu item ${index + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 512px"
          />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen menu image"
        >
          <div
            ref={zoomAreaRef}
            className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 min-h-0 touch-none"
            onWheel={onWheel}
            style={{ touchAction: "none" }}
          >
            <div
              className="inline-block transition-transform origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <div
                className="relative max-w-4xl min-w-[200px] min-h-[180px]"
                style={{
                  width: "min(92vw, calc(82vh * 4 / 3))",
                  height: "min(82vh, calc(92vw * 3 / 4))",
                }}
              >
                <Image
                  src={`/img/${num}.jpeg`}
                  alt={`Miguelito's menu item ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="92vw"
                  priority
                />
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-3 sm:gap-4 py-4 px-4 bg-black/80 flex-wrap"
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/20 text-white text-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="text-white text-sm tabular-nums min-w-[4ch]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/20 text-white text-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={resetAndClose}
              className="min-w-[44px] min-h-[44px] ml-4 rounded-full bg-white/20 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
