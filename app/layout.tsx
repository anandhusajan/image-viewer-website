import type { Metadata, Viewport } from "next";
import "./globals.css";
import LoadingScreen from "./components/LoadingScreen";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Miguelito's Ice Cream – Golden Plaza, Abu Hamour",
  description:
    "One Day. One Thousand Smiles. Miguelito's Ice Cream at Golden Plaza, Abu Hamour, Qatar. Inauguration 30-01-2026, 4PM. Free 1000 cups on inauguration day at Rambo Mart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-white text-gray-900">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
