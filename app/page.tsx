import Image from "next/image";
import MenuGallery from "./components/MenuGallery";

export default function Home() {
  return (
    <main className="min-h-[100dvh] flex flex-col max-w-full overflow-x-hidden">
      {/* Hero / Status bar */}
      <header className="bg-[#1e3a8a] text-white py-6 sm:py-10 px-4 sm:px-6 shrink-0 safe-area-top">
        <div className="flex items-center justify-center gap-3 sm:gap-5 max-w-4xl mx-auto">
          <Image
            src="/logo/logo.png"
            alt="Miguelito's Ice Cream logo"
            width={120}
            height={80}
            className="h-12 w-auto sm:h-16 shrink-0 object-contain"
            priority
          />
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-wide uppercase leading-tight">
            Miguelito&apos;s Ice Cream
          </h1>
        </div>
      </header>

      <MenuGallery />

      {/* Footer */}
      <footer className="py-4 px-4 sm:px-6 bg-[#1e3a8a] text-white text-center text-sm shrink-0 safe-area-bottom">
        Copyright © 2026 – Rambomart. All rights reserved
      </footer>
    </main>
  );
}
