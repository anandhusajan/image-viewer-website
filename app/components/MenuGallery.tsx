"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const MENU_IMAGES = ["01", "02", "03", "04", "05", "06"] as const;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const SWIPE_THRESHOLD = 60;

function getTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

export default function MenuGallery() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openViewer = useCallback((index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? MENU_IMAGES.length - 1 : i - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= MENU_IMAGES.length - 1 ? 0 : i + 1));
  }, []);

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 bg-gray-50 flex-1 min-h-0 w-full max-w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-3 sm:mb-6 text-center">
        Menu
      </h2>
      <div className="max-w-lg md:max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
        {MENU_IMAGES.map((num, index) => (
          <button
            key={num}
            type="button"
            onClick={() => openViewer(index)}
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
        ))}
      </div>

      {viewerOpen && (
        <ImageViewer
          currentIndex={currentIndex}
          onClose={closeViewer}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  );
}

function ImageViewer({
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const swipeRef = useRef<{ startX: number } | null>(null);
  const zoomRef = useRef(zoom);
  const panStateRef = useRef(pan);
  const zoomAreaRef = useRef<HTMLDivElement>(null);
  const mousePanRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);

  zoomRef.current = zoom;
  panStateRef.current = pan;

  const setZoomClamped = useCallback((value: number) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)));
  }, []);

  const resetForNewImage = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetForNewImage();
  }, [currentIndex, resetForNewImage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      else setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
    },
    []
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || zoom <= 1) return;
      mousePanRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: panStateRef.current.x,
        startPanY: panStateRef.current.y,
      };
    },
    [zoom]
  );

  const onMouseUp = useCallback(() => {
    mousePanRef.current = null;
  }, []);

  useEffect(() => {
    if (!zoomAreaRef.current) return;
    const el = zoomAreaRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (mousePanRef.current) {
        const dx = e.clientX - mousePanRef.current.startX;
        const dy = e.clientY - mousePanRef.current.startY;
        setPan({
          x: mousePanRef.current.startPanX + dx,
          y: mousePanRef.current.startPanY + dy,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  useEffect(() => {
    const el = zoomAreaRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { distance: getTouchDistance(e.touches), zoom: zoomRef.current };
        panRef.current = null;
        swipeRef.current = null;
      } else if (e.touches.length === 1) {
        if (zoomRef.current > 1) {
          panRef.current = {
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            startPanX: panStateRef.current.x,
            startPanY: panStateRef.current.y,
          };
          swipeRef.current = null;
        } else {
          swipeRef.current = { startX: e.touches[0].clientX };
          panRef.current = null;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const ratio = distance / pinchRef.current.distance;
        setZoomClamped(pinchRef.current.zoom * ratio);
      } else if (e.touches.length === 1 && panRef.current && zoomRef.current > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panRef.current.startX;
        const dy = e.touches[0].clientY - panRef.current.startY;
        setPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
      } else if (e.touches.length === 1 && swipeRef.current && zoomRef.current <= 1) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) {
        if (swipeRef.current && zoomRef.current <= 1) {
          const deltaX = e.changedTouches[0].clientX - swipeRef.current.startX;
          if (deltaX > SWIPE_THRESHOLD) onPrev();
          else if (deltaX < -SWIPE_THRESHOLD) onNext();
        }
        panRef.current = null;
        swipeRef.current = null;
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onPrev, onNext, setZoomClamped]);

  const num = MENU_IMAGES[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen image viewer"
    >
      <div
        ref={zoomAreaRef}
        className={`flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-8 min-h-0 select-none ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseUp}
        style={{ touchAction: "none" }}
      >
        <div
          className="inline-block transition-transform will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
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
              alt={`Miguelito's menu item ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="92vw"
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-3 sm:gap-4 py-4 px-4 bg-black/80 flex-wrap shrink-0"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="hidden md:flex items-center justify-center gap-3 sm:gap-4">
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
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] md:ml-4 rounded-full bg-white/20 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
